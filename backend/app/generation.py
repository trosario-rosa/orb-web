import re
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from random import choice, randint

from faker import Faker
from sqlalchemy.dialects.sqlite import insert

from app.database import SessionLocal
from app.models import Role, Status, User

BATCH_SIZE = 5_000
EMAIL_DOMAINS = ("example", "samplemail", "demomail")
EMAIL_TLDS = ("com", "net", "org")
ROLES, STATUSES = tuple(Role), tuple(Status)


def _generate_email(first_name: str, last_name: str) -> str:
    first = re.sub(r"[^a-z]", "", first_name.lower()) or "user"
    last = re.sub(r"[^a-z]", "", last_name.lower()) or "name"
    local = choice((f"{first[:3]}{last[:5]}", f"{first[:1]}.{last[:8]}", f"{first[:6]}_{last[:1]}"))
    return f"{local}{randint(100, 9999)}@{choice(EMAIL_DOMAINS)}.{choice(EMAIL_TLDS)}"


def _fake_user(fake: Faker, now: datetime) -> dict[str, object]:
    # Names come from en_US providers; email patterns and enums are controlled.
    # Avoid repeating request/email validation for every synthetic row.
    first_name, last_name = fake.first_name(), fake.last_name()
    status = choice(STATUSES)
    created_at = fake.date_time_between_dates(now - timedelta(days=730), now, tzinfo=UTC).replace(microsecond=0)
    updated_at = fake.date_time_between_dates(created_at, now, tzinfo=UTC).replace(microsecond=0)
    last_login = (
        fake.date_time_between_dates(created_at, updated_at, tzinfo=UTC).replace(microsecond=0)
        if status != Status.invited and fake.boolean(chance_of_getting_true=75)
        else None
    )
    return {
        "first_name": first_name, "last_name": last_name,
        "email": _generate_email(first_name, last_name),
        "role": choice(ROLES), "status": status,
        "created_at": created_at, "updated_at": updated_at, "last_login": last_login,
    }


def generate_users(count: int) -> Iterator[int]:
    yield 0
    fake = Faker("en_US", use_weighting=False)
    # Faker's date bounds have second precision on every platform.
    now = datetime.now(UTC).replace(microsecond=0)
    generated = 0
    while generated < count:
        batch = [_fake_user(fake, now) for _ in range(min(BATCH_SIZE, count - generated))]
        # Table defaults supply the same UUIDs and initial version as normal POSTs.
        # Rows whose email is already taken are skipped; later batches make up the shortfall.
        with SessionLocal() as db:
            generated += db.execute(insert(User.__table__).on_conflict_do_nothing(), batch).rowcount
            db.commit()
        yield generated
