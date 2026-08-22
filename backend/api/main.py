import os
import shutil
import json
import uuid
from typing import Optional
from datetime import datetime, timedelta
from urllib.parse import quote
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.pipeline import NyayAIPipeline
from database.connection import get_db, init_db
from database.models import Case, InputType, StatusType, CaseHearing, CaseQuery
from utils.llm_client import generate_text

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
    try:
        app.state.pipeline = NyayAIPipeline()
    except Exception:
        app.state.pipeline = None


# ── Request/response models ──────────────────────────────

class TextRequest(BaseModel):
    description: str
    court_type: Optional[str] = None


class ReportResponse(BaseModel):
    case_id: str
    report: str
    status: str


class NewCaseRequest(BaseModel):
    name: str
    description: str
    purpose: str
    hearing_dates: list[datetime] = []


class AskRequest(BaseModel):
    question: str


# ── Basic routes ──────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Welcome to NyayAI — Autonomous Legal Research Agent"}


# ── Original single-shot analysis routes ─────────────────

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
        result.append({
            "case_id": c.id,
            "input_type": c.input_type.value,
            "status": c.status.value,
            "created_at": str(c.created_at),
            "case_description": desc,
        })
    return result


# ── Dashboard / scheduling / Q&A routes ──────────────────

@app.post("/cases/new")
def create_case(request: NewCaseRequest, db: Session = Depends(get_db)):
    case_id = str(uuid.uuid4())
    case = Case(
        id=case_id,
        input_type=InputType.text,
        case_description=request.description,
        name=request.name,
        purpose=request.purpose,
        status=StatusType.processing,
    )
    db.add(case)
    db.commit()

    for hd in request.hearing_dates:
        db.add(CaseHearing(id=str(uuid.uuid4()), case_id=case_id, hearing_date=hd))
    db.commit()

    try:
        pipeline = getattr(app.state, "pipeline", None)
        if pipeline:
            full_text = f"{request.description}\n\nPurpose: {request.purpose}"
            result = pipeline.run_from_text(case_description=full_text, court_type=None)
            case.final_report = result.get("argument", "")
            case.status = StatusType.completed
            db.commit()

            # Dedicated rich-analysis pass — separate from the truncated
            # prediction-agent snippet, so the case gets a proper brief.
            try:
                analysis_prompt = f"""
                You are a senior Indian litigation strategist preparing a case brief.

                Case Name: {request.name}
                Purpose: {request.purpose}
                Description: {request.description}
                Prior Research Findings: {case.final_report or "None yet"}

                Write a thorough case analysis covering, in this order:
                1. Key facts and legal issues at stake
                2. Relevant laws, sections, or precedents that apply
                3. Strengths in the client's position
                4. Weaknesses or risks to watch for
                5. Recommended next steps for the lawyer

                Write in clear prose with short paragraphs per section (use
                the numbered headings above as section titles). Be specific
                to THIS case's facts, not generic legal commentary.
                """
                case.analysis = generate_text(analysis_prompt)
                db.commit()
            except Exception:
                # fall back to whatever the pipeline's prediction produced
                case.analysis = result.get("outcome", {}).get("risk", "")
                db.commit()
    except Exception as e:
        case.status = StatusType.failed
        case.error_message = str(e)
        db.commit()

    return {"case_id": case_id, "name": request.name}


@app.get("/case/{case_id}/hearings")
def list_hearings(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    hearings = db.query(CaseHearing).filter(CaseHearing.case_id == case_id).order_by(CaseHearing.hearing_date).all()

    def google_link(h):
        start = h.hearing_date
        end = start + timedelta(hours=1)
        fmt = lambda dt: dt.strftime("%Y%m%dT%H%M%S")
        title = (case.name if case else None) or "Court Hearing"
        details = (case.purpose if case else "") or ""
        params = {
            "action": "TEMPLATE",
            "text": f"Hearing — {title}",
            "dates": f"{fmt(start)}/{fmt(end)}",
            "details": f"{details}\nCase ID: {case_id}",
        }
        query = "&".join(f"{k}={quote(str(v))}" for k, v in params.items())
        return f"https://calendar.google.com/calendar/render?{query}"

    return [
        {
            "id": h.id,
            "hearing_date": h.hearing_date.isoformat(),
            "note": h.note,
            "google_calendar_url": google_link(h),
            "ics_url": f"/case/{case_id}/hearings/{h.id}/calendar.ics",
        }
        for h in hearings
    ]


@app.get("/case/{case_id}/hearings/{hearing_id}/calendar.ics")
def hearing_ics(case_id: str, hearing_id: str, db: Session = Depends(get_db)):
    hearing = db.query(CaseHearing).filter(CaseHearing.id == hearing_id, CaseHearing.case_id == case_id).first()
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")
    case = db.query(Case).filter(Case.id == case_id).first()

    start = hearing.hearing_date
    end = start + timedelta(hours=1)
    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    fmt = lambda dt: dt.strftime("%Y%m%dT%H%M%S")
    title = case.name or "Court Hearing"

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NyayaAI//Legal Case Scheduler//EN
BEGIN:VEVENT
UID:{hearing_id}@nyayai
DTSTAMP:{dtstamp}
DTSTART:{fmt(start)}
DTEND:{fmt(end)}
SUMMARY:Hearing — {title}
DESCRIPTION:{(case.purpose or '')}\\nCase ID: {case_id}
END:VEVENT
END:VCALENDAR"""

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=hearing_{hearing_id}.ics"},
    )


@app.get("/case/{case_id}/full-analysis")
def get_full_analysis(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {
        "case_id": case.id,
        "name": case.name,
        "purpose": case.purpose,
        "description": case.case_description,
        "analysis": case.analysis,
        "final_report": case.final_report,
        "status": case.status.value,
    }


@app.get("/case/{case_id}/suggested-questions")
def suggested_questions(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    prompt = f"""
    You are a senior Indian litigation strategist reviewing this case file.

    Case Name: {case.name}
    Purpose: {case.purpose}
    Description: {case.case_description}
    Analysis so far: {case.analysis or "Not yet analyzed"}

    Suggest the 5 most important, case-specific questions a lawyer preparing
    this case should ask next. Make them concrete and specific to THIS case's
    facts, not generic legal questions.

    Respond ONLY with a JSON array of 5 strings, no extra text, no markdown,
    no backticks. Example format:
    ["question 1", "question 2", "question 3", "question 4", "question 5"]
    """
    raw = generate_text(prompt).strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:].strip()

    try:
        questions = json.loads(raw)
    except Exception:
        questions = [raw]

    return {"case_id": case_id, "suggested_questions": questions}


@app.post("/case/{case_id}/ask")
def ask_case_question(case_id: str, request: AskRequest, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    context = f"""
    You are a legal assistant answering questions about a specific case file.

    Case Name: {case.name}
    Purpose: {case.purpose}
    Description: {case.case_description}
    {"Prior Research Report: " + case.final_report if case.final_report else ""}

    Question: {request.question}

    Answer clearly and concisely based on the case details above.
    """
    answer = generate_text(context)

    q = CaseQuery(id=str(uuid.uuid4()), case_id=case_id, question=request.question, answer=answer)
    db.add(q)
    db.commit()

    return {"question": request.question, "answer": answer}


@app.get("/case/{case_id}/qa")
def get_case_qa(case_id: str, db: Session = Depends(get_db)):
    rows = db.query(CaseQuery).filter(CaseQuery.case_id == case_id).order_by(CaseQuery.created_at).all()
    return [{"question": r.question, "answer": r.answer, "created_at": str(r.created_at)} for r in rows]