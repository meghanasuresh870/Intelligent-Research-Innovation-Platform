import json
from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Integer, String, Text

from app.db.base import Base


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id = Column(String(500), nullable=True, index=True)
    source = Column(String(100), nullable=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    authors = Column(String(1000), nullable=False, index=True)
    abstract = Column(Text, nullable=True)
    publication_date = Column(Date, nullable=True)
    publication_year = Column(Integer, nullable=True, index=True)
    research_area = Column(String(255), nullable=True, index=True)
    keywords = Column(String(1000), nullable=True, index=True)
    journal = Column(String(500), nullable=True)
    doi = Column(String(255), nullable=True)
    normalized_doi = Column(String(255), nullable=True, unique=True, index=True)
    title_fingerprint = Column(String(200), nullable=True, index=True)
    first_author_fingerprint = Column(String(200), nullable=True, index=True)
    source_url = Column(String(1000), nullable=True)
    open_access_url = Column(String(1000), nullable=True)
    pdf_url = Column(String(1000), nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    def get_authors(self) -> list[str]:
        """Return authors decoded from the stored JSON string."""
        try:
            value = json.loads(self.authors or "[]")
            return value if isinstance(value, list) else [str(value)]
        except (ValueError, TypeError):
            return [self.authors] if self.authors else []

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
