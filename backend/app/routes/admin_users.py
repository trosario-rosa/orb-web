import json
import logging
from collections.abc import Iterator
from io import TextIOWrapper
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

from app import generation, services, user_csv
from app.database import Database
from app.schemas import (
    GenerateUsersRequest,
    ImportUsersResult,
    ResetUsersResult,
)

router = APIRouter(prefix="/admin/users", tags=["User administration"])
logger = logging.getLogger(__name__)


def _sse(event: str, **data: object) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _generation_events(count: int) -> Iterator[str]:
    generated = 0
    try:
        for generated in generation.generate_users(count):
            yield _sse("progress", generated=generated, total=count)
    except Exception:
        logger.exception("User generation failed after %s committed users", generated)
        yield _sse("error", generated=generated, total=count, message="Generation failed; earlier batches remain saved")
    else:
        yield _sse("complete", generated=generated, total=count)


@router.delete("/reset", response_model=ResetUsersResult, description="Delete all users.")
def reset_users(db: Database) -> ResetUsersResult:
    return ResetUsersResult(deleted=services.reset_users(db))


@router.post(
    "/generate", response_class=StreamingResponse,
    description="Generate count fake users with SSE progress after each committed batch of up to 5,000 users. "
                "Emails combine name slices, random digits, and predefined domain/TLD choices. "
                "Faker randomizes timestamps: created_at <= updated_at <= now; last_login is null "
                "or between creation and update (always null for invited users). "
                "Events: progress, complete, error. Count is a positive integer with no fixed maximum. "
                "Consume this POST stream with fetch; native EventSource only supports GET.",
    responses={200: {"content": {"text/event-stream": {"schema": {"type": "string"}}}}},
)
def generate_users(data: GenerateUsersRequest) -> StreamingResponse:
    return StreamingResponse(
        _generation_events(data.count), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post(
    "/import", response_model=ImportUsersResult,
    description="Import UTF-8 CSV in batches. Existing IDs are overwritten and their versions incremented. "
                "Required columns: " + ", ".join(user_csv.CSV_COLUMNS) + ". "
                "Timestamps are preserved, must include a timezone, and must satisfy "
                "created_at <= updated_at <= now. last_login must be empty or between those timestamps. "
                "Invalid rows and rows whose email belongs to another user are skipped; the first 100 errors are returned. No If-Match is required.",
    responses={400: {"description": "Invalid CSV header or encoding"}},
)
def import_users(db: Database, file: Annotated[UploadFile, File(description="UTF-8 users CSV")]) -> ImportUsersResult:
    source = TextIOWrapper(file.file, encoding="utf-8-sig", newline="")
    try:
        return user_csv.import_users(db, source)
    except UnicodeError:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8; earlier committed batches remain saved") from None
    finally:
        source.detach()  # UploadFile owns and closes its spooled temporary file.


@router.get(
    "/export", response_class=StreamingResponse,
    description="Stream all users as CSV, or select users with repeated ids query parameters. "
                "Includes all public user fields, with UTC ISO timestamps and an empty cell for null last_login. "
                "Unknown IDs are skipped and duplicate IDs appear once. Export does not change versions.",
    responses={200: {
        "content": {"text/csv": {"schema": {"type": "string"}}},
        "headers": {"Content-Disposition": {"schema": {"type": "string"}}},
    }},
)
def export_users(ids: Annotated[list[UUID] | None, Query()] = None) -> StreamingResponse:
    return StreamingResponse(
        user_csv.export_users(ids), media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="users.csv"'},
    )
