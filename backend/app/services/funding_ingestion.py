"""
backend/app/services/funding_ingestion.py

Module 4: Funding Data Ingestion

Responsibilities:
- Fetch funding opportunities from registered source clients.
- Normalize raw records.
- Detect duplicates using external_id + source.
- Fall back to title + organization + deadline date.
- Insert new records.
- Update records only when their actual values change.
- Track ingestion results and errors.
"""

import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.funding import FundingOpportunity
from app.schemas.funding import FundingOpportunityCreate, IngestionSummary
from app.services.funding_sources.base import FundingSourceClient
from app.services.funding_sources.normalizer import normalize_opportunity

logger = logging.getLogger(__name__)


# Fields that may be updated when a source record changes.
_UPDATABLE_FIELDS = (
    "title",
    "description",
    "funding_amount",
    "currency",
    "deadline",
    "eligibility",
    "research_areas",
    "keywords",
    "status",
    "source_url",
    "application_url",
)


def _normalize_datetime(value: datetime | None) -> datetime | None:
    """
    Normalize datetime values to UTC for reliable comparison.

    SQLite may return a timezone-aware datetime column as a naive datetime.
    Naive values are interpreted as UTC because this application normalizes
    funding deadlines to UTC.
    """
    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def _values_equal(field: str, new_value: Any, old_value: Any) -> bool:
    """
    Compare incoming and stored values without false-positive updates.

    Handles:
    - Datetime timezone differences.
    - Decimal and numeric values.
    - Lists and JSON-backed fields.
    - Ordinary scalar values.
    """
    if field == "deadline":
        return (
            _normalize_datetime(new_value)
            == _normalize_datetime(old_value)
        )

    if field == "funding_amount":
        if new_value is None or old_value is None:
            return new_value is old_value

        try:
            return Decimal(str(new_value)) == Decimal(str(old_value))
        except (ValueError, TypeError, ArithmeticError):
            return new_value == old_value

    if isinstance(new_value, (list, dict)) or isinstance(
        old_value, (list, dict)
    ):
        return new_value == old_value

    return new_value == old_value


async def run_ingestion(
    db: Session,
    source_client: FundingSourceClient,
    keywords: list[str],
    limit: int = 50,
) -> IngestionSummary:
    """
    Run the fetch -> normalize -> insert/update cycle for one source.

    The caller supplies the SQLAlchemy session. This function commits
    successful ingestion changes and rolls back if the commit fails.
    """
    summary = IngestionSummary(source=source_client.source_id)

    logger.info(
        "[ingestion][%s] Starting fetch: keywords=%r limit=%d",
        source_client.source_id,
        keywords,
        limit,
    )

    try:
        raw_records = await source_client.fetch(
            keywords=keywords,
            limit=limit,
        )
    except Exception as exc:
        message = f"Source fetch failed: {type(exc).__name__}: {exc}"
        summary.errors.append(message)

        logger.exception(
            "[ingestion][%s] %s",
            source_client.source_id,
            message,
        )
        return summary

    summary.fetched = len(raw_records)

    logger.info(
        "[ingestion][%s] Fetched %d raw records",
        source_client.source_id,
        summary.fetched,
    )

    try:
        for raw in raw_records:
            try:
                normalized = normalize_opportunity(
                    raw,
                    source_client.source_id,
                )

                if normalized is None:
                    summary.skipped_malformed += 1

                    logger.warning(
                        "[ingestion][%s] Skipped malformed record: "
                        "external_id=%r",
                        source_client.source_id,
                        raw.get("external_id"),
                    )
                    continue

                result = _upsert_record(db, normalized)

                if result == "inserted":
                    summary.inserted += 1
                elif result == "updated":
                    summary.updated += 1
                elif result == "duplicate":
                    summary.skipped_duplicates += 1

            except Exception as exc:
                summary.errors.append(
                    f"Record processing failed: "
                    f"{type(exc).__name__}: {exc}"
                )

                logger.exception(
                    "[ingestion][%s] Failed to process record "
                    "external_id=%r",
                    source_client.source_id,
                    raw.get("external_id"),
                )

                # Do not commit a potentially inconsistent transaction.
                raise

        db.commit()

        logger.info(
            "[ingestion][%s] Committed: inserted=%d updated=%d "
            "skipped_duplicates=%d skipped_malformed=%d errors=%d",
            source_client.source_id,
            summary.inserted,
            summary.updated,
            summary.skipped_duplicates,
            summary.skipped_malformed,
            len(summary.errors),
        )

    except Exception as exc:
        db.rollback()

        message = (
            f"DB ingestion transaction failed: "
            f"{type(exc).__name__}: {exc}"
        )

        summary.errors.append(message)

        logger.exception(
            "[ingestion][%s] %s",
            source_client.source_id,
            message,
        )

        # Database rollback means inserts and updates in this transaction
        # were not persisted. Reset their summary counts accordingly.
        summary.inserted = 0
        summary.updated = 0
        summary.skipped_duplicates = 0

    return summary


def _upsert_record(
    db: Session,
    data: FundingOpportunityCreate,
) -> str:
    """
    Insert or update a single funding opportunity.

    Deduplication:
      1. external_id + source
      2. title + organization + deadline date

    Returns:
      "inserted"  - new record added
      "updated"   - existing record changed
      "duplicate" - existing record already has the same values
    """
    existing = _find_existing(db, data)

    if existing is None:
        new_record = FundingOpportunity(**data.model_dump())
        db.add(new_record)

        logger.debug(
            "[ingestion] INSERT external_id=%r source=%r title=%r",
            data.external_id,
            data.source,
            (data.title or "")[:60],
        )

        return "inserted"

    changed = False

    for field in _UPDATABLE_FIELDS:
        new_value = getattr(data, field, None)
        old_value = getattr(existing, field, None)

        # A missing incoming value must not erase an existing value.
        if new_value is None:
            continue

        if _values_equal(field, new_value, old_value):
            continue

        setattr(existing, field, new_value)
        changed = True

    if changed:
        existing.updated_at = datetime.now(timezone.utc)

        logger.debug(
            "[ingestion] UPDATE external_id=%r source=%r",
            data.external_id,
            data.source,
        )

        return "updated"

    logger.debug(
        "[ingestion] DUPLICATE (no changes) external_id=%r source=%r",
        data.external_id,
        data.source,
    )

    return "duplicate"


def _find_existing(
    db: Session,
    data: FundingOpportunityCreate,
) -> FundingOpportunity | None:
    """
    Find an existing record by external ID and source.

    If no primary match exists, use title, organization, source, and
    deadline date as the fallback deduplication key.
    """
    statement = select(FundingOpportunity).where(
        and_(
            FundingOpportunity.external_id == data.external_id,
            FundingOpportunity.source == data.source,
        )
    )

    record = db.scalars(statement).first()

    if record is not None:
        return record

    if not data.title or not data.organization:
        return None

    deadline_date = data.deadline.date() if data.deadline else None

    fallback_statement = select(FundingOpportunity).where(
        and_(
            FundingOpportunity.title == data.title,
            FundingOpportunity.organization == data.organization,
            FundingOpportunity.source == data.source,
        )
    )

    candidates = db.scalars(fallback_statement).all()

    for candidate in candidates:
        candidate_deadline_date = (
            candidate.deadline.date()
            if candidate.deadline is not None
            else None
        )

        if candidate_deadline_date == deadline_date:
            logger.debug(
                "[ingestion] Fallback dedup matched: "
                "title=%r organization=%r deadline=%r",
                data.title[:40],
                data.organization[:40],
                deadline_date,
            )

            return candidate

    return None
