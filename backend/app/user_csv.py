import csv
from collections.abc import Iterator
from datetime import datetime
from io import StringIO
from typing import TextIO
from uuid import UUID

from pydantic import ValidationError
from sqlalchemy import select, text
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.errors import InvalidImport
from app.models import User
from app.schemas import ImportRowError, ImportUsersResult, UserImport

BATCH_SIZE = 500
MAX_IMPORT_ERRORS = 100
CSV_COLUMNS = ("id", "first_name", "last_name", "email", "role", "status", "created_at", "updated_at", "last_login")
Row = dict[str, object]


class _RowRejected(Exception):
    pass


def _reject(summary: ImportUsersResult, row_number: int, error: str) -> None:
    summary.rejected += 1
    if len(summary.errors) < MAX_IMPORT_ERRORS:
        summary.errors.append(ImportRowError(row=row_number, error=error))
    else:
        summary.errors_truncated += 1


def _validated(columns: list[str], values: list[str]) -> Row:
    if len(values) != len(columns):
        raise _RowRejected(f"Expected exactly {len(CSV_COLUMNS)} fields")
    try:
        user = UserImport.model_validate(dict(zip(columns, values)))
    except ValidationError as error:
        raise _RowRejected("; ".join(
            f"{'.'.join(map(str, item['loc'])) or 'row'}: {item['msg']}"
            for item in error.errors(include_url=False, include_context=False, include_input=False)
        )) from None
    return {**user.model_dump(), "id": str(user.id)}


def _upsert(db: Session, rows: list[Row]) -> tuple[int, int, list[int]]:
    """Returns the created count, updated count and indexes of rows with a taken email."""
    # Lock before counting existing IDs, so another writer cannot invalidate counts.
    db.execute(text("BEGIN IMMEDIATE"))
    existing = set(db.scalars(select(User.id).where(User.id.in_([row["id"] for row in rows]))))
    statement = insert(User.__table__)
    statement = statement.on_conflict_do_update(
        index_elements=[User.id],
        set_={
            **{field: statement.excluded[field] for field in CSV_COLUMNS[1:]},
            # Bulk SQL bypasses ORM version tracking; increment in the database.
            "version": User.version + 1,
        },
    )
    conflicts: list[int] = []
    try:
        with db.begin_nested():
            db.execute(statement, rows)
    except IntegrityError:
        # Retry row by row, so only rows whose email belongs to another user are rejected.
        for index, row in enumerate(rows):
            try:
                with db.begin_nested():
                    db.execute(statement, row)
            except IntegrityError:
                conflicts.append(index)
    db.commit()
    created = 0
    for index, row in enumerate(rows):
        if index not in conflicts and row["id"] not in existing:
            created += 1
            existing.add(row["id"])
    return created, len(rows) - len(conflicts) - created, conflicts


def _save_batch(db: Session, batch: list[tuple[int, Row]], summary: ImportUsersResult) -> None:
    created, updated, conflicts = _upsert(db, [row for _, row in batch])
    summary.created += created
    summary.updated += updated
    for index in conflicts:
        _reject(summary, batch[index][0], "email: already in use by another user")
    batch.clear()


def import_users(db: Session, source: TextIO) -> ImportUsersResult:
    reader = csv.reader(source, strict=True)
    try:
        columns = next(reader, [])
    except csv.Error:
        raise InvalidImport("Invalid CSV header") from None
    if len(columns) != len(CSV_COLUMNS) or set(columns) != set(CSV_COLUMNS):
        raise InvalidImport("CSV must contain exactly: " + ",".join(CSV_COLUMNS))

    summary = ImportUsersResult()
    batch: list[tuple[int, Row]] = []
    while True:
        row_number = reader.line_num + 1
        try:
            values = next(reader)
        except StopIteration:
            break
        except csv.Error:
            summary.processed += 1
            _reject(summary, row_number, "Malformed CSV record or field too large")
            continue
        if not values:  # Ignore blank lines, not rows containing empty fields.
            continue
        summary.processed += 1
        try:
            batch.append((row_number, _validated(columns, values)))
        except _RowRejected as error:
            _reject(summary, row_number, str(error))
        if len(batch) == BATCH_SIZE:
            _save_batch(db, batch, summary)
    if batch:
        _save_batch(db, batch, summary)
    return summary


def export_users(ids: list[UUID] | None = None) -> Iterator[str]:
    buffer = StringIO(newline="")
    writer = csv.writer(buffer)
    writer.writerow(CSV_COLUMNS)
    yield buffer.getvalue()
    selected = sorted({str(user_id) for user_id in ids}) if ids is not None else None
    last_id = None
    offset = 0
    while True:
        statement = select(*(getattr(User, field) for field in CSV_COLUMNS)).order_by(User.id).limit(BATCH_SIZE)
        if selected is not None:
            batch_ids = selected[offset:offset + BATCH_SIZE]
            if not batch_ids:
                break
            statement = statement.where(User.id.in_(batch_ids))
            offset += BATCH_SIZE
        elif last_id is not None:
            statement = statement.where(User.id > last_id)
        # Close the read transaction before yielding to a potentially slow client.
        with SessionLocal() as db:
            rows = db.execute(statement).all()
        if rows:
            buffer.seek(0)
            buffer.truncate(0)
            writer.writerows(
                [value.isoformat().replace("+00:00", "Z") if isinstance(value, datetime) else value for value in row]
                for row in rows
            )
            last_id = rows[-1].id
            yield buffer.getvalue()
        if selected is None and len(rows) < BATCH_SIZE:
            break
