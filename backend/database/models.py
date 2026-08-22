from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from database.connection import Base
from datetime import datetime
import uuid
import enum


class InputType(enum.Enum):
    text = "text"
    pdf = "pdf"


class StatusType(enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    input_type = Column(Enum(InputType), nullable=False)
    case_description = Column(Text, nullable=False)
    final_report = Column(Text, nullable=True)
    status = Column(Enum(StatusType), default=StatusType.pending)
    error_message = Column(Text, nullable=True)
    name = Column(String, nullable=True)
    purpose = Column(String, nullable=True)
    analysis = Column(Text, nullable=True)


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    status = Column(Enum(StatusType), default=StatusType.pending)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)


class CaseHearing(Base):
    __tablename__ = "case_hearings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    hearing_date = Column(DateTime(timezone=True), nullable=False)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CaseQuery(Base):
    __tablename__ = "case_queries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)