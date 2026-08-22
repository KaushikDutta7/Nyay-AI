import os
import shutil
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from core.pipeline import NyayAIPipeline
from database.connection import get_db, init_db
from database.models import Case, InputType, StatusType
import uuid

app = FastAPI(
    title="NyayAI",
    description="Autonomous Legal Research Agent for Indian Judiciary",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    # lazily initialize the pipeline at startup so imports and envvars are ready
    try:
        app.state.pipeline = NyayAIPipeline()
    except Exception:
        app.state.pipeline = None


class TextRequest(BaseModel):
    description: str
    court_type: Optional[str] = None

class ReportResponse(BaseModel):
    case_id: str
    report: str
    status: str


class ErrorResponse(BaseModel):
    case_id: str
    error: str
    status: str


@app.get("/")
def root():
    return {"message": "Welcome to NyayAI — Autonomous Legal Research Agent"}


@app.post("/analyze/text")
def analyze_text(request: TextRequest, db: Session = Depends(get_db)):
    case_id = str(uuid.uuid4())
    case = Case(
        id=case_id,
        input_type=InputType.text,
        case_description=request.description,
        status=StatusType.processing,
    )
    db.add(case)
    db.commit()

    try:
        pipeline = getattr(app.state, "pipeline", None)
        if not pipeline:
            raise HTTPException(status_code=500, detail="Pipeline not initialized")

        result = pipeline.run_from_text(
            case_description=request.description, court_type=request.court_type
        )

        db.query(Case).filter(Case.id == case_id).update({
            "final_report": result.get("argument", ""),
            "status": StatusType.completed
        })
        case.final_report = result.get("argument", "")
        case.status = StatusType.completed
        db.commit()
        return {"case_id": case_id, "status": "completed", **result}

    except Exception as e:
        case.status = StatusType.failed
        case.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/pdf")
async def analyze_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    case_id = str(uuid.uuid4())
    temp_path = f"temp_{case_id}_{file.filename}"

    case = Case(
        id=case_id,
        input_type=InputType.pdf,
        case_description=f"PDF: {file.filename}",
        status=StatusType.processing,
    )
    db.add(case)
    db.commit()

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        pipeline = getattr(app.state, "pipeline", None)
        if not pipeline:
            raise HTTPException(status_code=500, detail="Pipeline not initialized")

        result = pipeline.run_from_pdf(pdf_path=temp_path)
        case.final_report = result.get("argument", "")
        case.case_description = f"PDF: {file.filename}"
        case.status = StatusType.completed
        db.commit()
        return {"case_id": case_id, "status": "completed", **result}

    except Exception as e:
        case.status = StatusType.failed
        case.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/case/{case_id}", response_model=ReportResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return ReportResponse(
        case_id=case.id, report=case.final_report or "", status=case.status.value
    )


@app.get("/cases")
def get_all_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    result = []
    for c in cases:
        desc = c.case_description[:100] + "..." if len(c.case_description) > 100 else c.case_description
        result.append(
            {
                "case_id": c.id,
                "input_type": c.input_type.value,
                "status": c.status.value,
                "created_at": str(c.created_at),
                "case_description": desc,
            }
        )
    return result