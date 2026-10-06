from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Header, Query, Response

from app import services
from app.database import Database
from app.errors import EmailInUse, UserNotFound
from app.models import Role, Status, User
from app.schemas import Message, SortDirection, UserPage, UserRead, UserSortField, UserWrite

router = APIRouter(tags=["Users"])
ETAG_RESPONSE = {
    "headers": {"ETag": {"description": "Quoted record version", "schema": {"type": "string"}}}
}
NOT_FOUND = {"description": UserNotFound.message}
EMAIL_IN_USE = {"description": EmailInUse.message}


def _with_etag(user: User, response: Response) -> UserRead:
    response.headers["ETag"] = services.etag(user)
    return UserRead.model_validate(user)


@router.get("/users", response_model=UserPage)
def list_users(
    db: Database,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
    sort_by: Annotated[UserSortField, Query(alias="sortBy")] = "id",
    direction: SortDirection = "ascending",
    role: Annotated[list[Role] | None, Query(description="Include these roles; repeat for multiple values")] = None,
    status: Annotated[list[Status] | None, Query(description="Include these statuses; repeat for multiple values")] = None,
    q: Annotated[str | None, Query(
        max_length=254,
        description="Case-insensitive substring search across first name, last name, and email. "
                    "Surrounding whitespace is trimmed; blank searches are ignored.",
    )] = None,
) -> UserPage:
    items, total = services.list_users(db, skip, limit, sort_by, direction, role, status, q)
    return UserPage(items=[UserRead.model_validate(user) for user in items], total=total)


@router.get("/user/{user_id}", response_model=UserRead, responses={200: ETAG_RESPONSE, 404: NOT_FOUND})
def get_user(user_id: UUID, response: Response, db: Database) -> UserRead:
    return _with_etag(services.get_user(db, user_id), response)


@router.post("/user", response_model=UserRead, status_code=201, responses={201: ETAG_RESPONSE, 409: EMAIL_IN_USE})
def create_user(data: UserWrite, response: Response, db: Database) -> UserRead:
    return _with_etag(services.create_user(db, data), response)


@router.put(
    "/user/{user_id}",
    response_model=UserRead,
    responses={
        200: ETAG_RESPONSE,
        404: NOT_FOUND,
        409: EMAIL_IN_USE,
        412: {"description": "ETag is stale or does not match"},
        428: {"description": "If-Match header is missing"},
    },
)
def update_user(
    user_id: UUID,
    data: UserWrite,
    response: Response,
    db: Database,
    if_match: Annotated[str | None, Header(description='Required: the exact ETag, e.g. "1"')] = None,
) -> UserRead:
    return _with_etag(services.update_user(db, user_id, data, if_match), response)


@router.post("/user/{user_id}/password-reset", response_model=Message, responses={404: NOT_FOUND})
def password_reset(user_id: UUID, db: Database) -> Message:
    return Message(message=services.request_password_reset(db, user_id))
