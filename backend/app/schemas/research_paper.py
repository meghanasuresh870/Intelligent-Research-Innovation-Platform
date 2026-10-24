from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ResearchPaperBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    authors: str = Field(..., min_length=1, max_length=1000)
    abstract: Optional[str] = None
    publication_year: Optional[int] = Field(default=None, ge=1900)
    research_area: Optional[str] = Field(default=None, max_length=255)
    keywords: Optional[str] = Field(default=None, max_length=1000)
    journal: Optional[str] = Field(default=None, max_length=500)
    doi: Optional[str] = Field(default=None, max_length=255)
    pdf_url: Optional[str] = Field(default=None, max_length=1000)


class ResearchPaperCreate(ResearchPaperBase):
    external_id: Optional[str] = None
    source: str = "openalex"
    authors: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    research_area: list[str] = Field(default_factory=list)
    publication_date: Optional[date] = None
    source_url: Optional[str] = None
    open_access_url: Optional[str] = None


class ResearchPaperResponse(ResearchPaperBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class SyncSummary(BaseModel):
    fetched: int = 0
    inserted: int = 0
    updated: int = 0
    skipped_duplicates: int = 0
    failed: int = 0
