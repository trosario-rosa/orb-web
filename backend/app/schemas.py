from datetime import UTC, datetime
from typing import Annotated, Literal, Self
from uuid import UUID

from pydantic import (
    AwareDatetime, BaseModel, ConfigDict, EmailStr, Field, StrictInt,
    StringConstraints, ValidationInfo, field_validator, model_validator,
)

from app.models import Role, Status

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
UserSortField = Literal[
    "id", "first_name", "last_name", "email", "role", "status", "created_at", "updated_at", "last_login"
]
SortDirection = Literal["ascending", "descending"]


class UserWrite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: Name
    last_name: Name
    email: Annotated[EmailStr, Field(max_length=254)]
    role: Role
    status: Status


class UserRead(UserWrite):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    last_login: datetime | None


class UserImport(UserRead):
    created_at: AwareDatetime
    updated_at: AwareDatetime
    last_login: AwareDatetime | None

    @field_validator("created_at", "updated_at", "last_login", mode="before")
    @classmethod
    def parse_csv_timestamp(cls, value: object, info: ValidationInfo) -> object:
        if isinstance(value, str):
            if info.field_name == "last_login" and not value.strip():
                return None
            return datetime.fromisoformat(value.strip())
        return value

    @model_validator(mode="after")
    def validate_timeline(self) -> Self:
        if not self.created_at <= self.updated_at <= datetime.now(UTC):
            raise ValueError("Timestamps must satisfy created_at <= updated_at <= now")
        if self.last_login is not None and not self.created_at <= self.last_login <= self.updated_at:
            raise ValueError("last_login must be between created_at and updated_at, or empty")
        return self


class UserPage(BaseModel):
    items: list[UserRead]
    total: int


class Message(BaseModel):
    message: str


class ResetUsersResult(BaseModel):
    deleted: int


class GenerateUsersRequest(BaseModel):
    count: Annotated[StrictInt, Field(gt=0)]


class ImportRowError(BaseModel):
    row: int
    error: str


class ImportUsersResult(BaseModel):
    processed: int = 0
    created: int = 0
    updated: int = 0
    rejected: int = 0
    errors: list[ImportRowError] = Field(default_factory=list)
    errors_truncated: int = 0
