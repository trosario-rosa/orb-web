from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import DateTime, Dialect, Enum, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import TypeDecorator

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class UTCDateTime(TypeDecorator[datetime]):
    """Timezone-aware in Python; stored as naive UTC, as SQLite has no timezones."""

    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect: Dialect) -> datetime | None:
        return None if value is None else value.astimezone(UTC).replace(tzinfo=None)

    def process_result_value(self, value: datetime | None, dialect: Dialect) -> datetime | None:
        return None if value is None else value.replace(tzinfo=UTC)


class Role(StrEnum):
    Admin = "Admin"
    Member = "Member"
    Viewer = "Viewer"


class Status(StrEnum):
    active = "active"
    invited = "invited"
    suspended = "suspended"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_role_status_id", "role", "status", "id"),
        Index("ix_users_status_id", "status", "id"),
        Index("ix_users_created_at_id", "created_at", "id"),
        # Addresses differing only in ASCII letter case are the same address.
        Index("ux_users_email", text("email COLLATE NOCASE"), unique=True),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(254))
    role: Mapped[Role] = mapped_column(Enum(Role, create_constraint=True))
    status: Mapped[Status] = mapped_column(Enum(Status, create_constraint=True))
    created_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime, default=utc_now, onupdate=utc_now)
    last_login: Mapped[datetime | None] = mapped_column(UTCDateTime, default=None)
    version: Mapped[int] = mapped_column(default=1, nullable=False)

    # ORM updates include WHERE id = ... AND version = <previous version>.
    __mapper_args__ = {"version_id_col": version}
