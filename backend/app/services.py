from uuid import UUID

from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from app.errors import EmailInUse, UserNotFound, VersionMismatch, VersionRequired
from app.models import Role, Status, User
from app.schemas import SortDirection, UserSortField, UserWrite


def etag(user: User) -> str:
    return f'"{user.version}"'


def _commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise EmailInUse from None
    except StaleDataError:
        db.rollback()
        raise VersionMismatch("User changed during the update; fetch the user again") from None


def get_user(db: Session, user_id: UUID) -> User:
    user = db.get(User, str(user_id))
    if user is None:
        raise UserNotFound
    return user


def list_users(
    db: Session, skip: int, limit: int,
    sort_by: UserSortField = "id", direction: SortDirection = "ascending",
    role: list[Role] | None = None, status: list[Status] | None = None,
    q: str | None = None,
) -> tuple[list[User], int]:
    filters = []
    if role:
        filters.append(User.role.in_(role))
    if status:
        filters.append(User.status.in_(status))
    if q and (query := q.strip()):
        filters.append(or_(
            User.first_name.icontains(query, autoescape=True),
            User.last_name.icontains(query, autoescape=True),
            User.email.icontains(query, autoescape=True),
        ))
    column = getattr(User, sort_by)  # Validated against the public-field whitelist.
    if sort_by in {"first_name", "last_name", "email"}:
        column = column.collate("NOCASE")
    order = column.desc() if direction == "descending" else column.asc()
    if sort_by == "last_login":
        order = order.nulls_last()
    ordering = [order] if sort_by == "id" else [order, User.id.asc()]
    total = db.scalar(select(func.count()).select_from(User).where(*filters))
    if not total:
        return [], 0
    items = db.scalars(select(User).where(*filters).order_by(*ordering).offset(skip).limit(limit)).all()
    return list(items), total


def create_user(db: Session, data: UserWrite) -> User:
    user = User(**data.model_dump())
    db.add(user)
    _commit(db)
    return user


def update_user(db: Session, user_id: UUID, data: UserWrite, if_match: str | None) -> User:
    user = get_user(db, user_id)
    if if_match is None:
        raise VersionRequired
    if if_match.strip() != etag(user):
        raise VersionMismatch

    for field, value in data.model_dump().items():
        setattr(user, field, value)
    # Explicitly increment even when the submitted fields are unchanged.
    user.version += 1
    _commit(db)
    return user


def request_password_reset(db: Session, user_id: UUID) -> str:
    get_user(db, user_id)
    # Replace this simulation with reset-token delivery when that feature is needed.
    return "Password reset requested"


def reset_users(db: Session) -> int:
    result = db.execute(delete(User.__table__))
    db.commit()
    return result.rowcount
