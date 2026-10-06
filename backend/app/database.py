import os
from collections.abc import Iterator
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from sqlalchemy import URL, create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


database_path = Path(os.getenv("DATABASE_PATH", "data/users.db"))
engine = create_engine(
    URL.create("sqlite", database=str(database_path)),
    connect_args={"check_same_thread": False, "timeout": 30},
)
# Return the committed version without a second read racing with another update.
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(engine)
    # create_all skips existing tables, so add indexes newer than the database file.
    for table in Base.metadata.tables.values():
        for index in table.indexes:
            try:
                index.create(engine, checkfirst=True)
            except IntegrityError:
                raise RuntimeError(
                    f"Cannot create {index.name}: rows in {database_path} violate it. "
                    "Remove the duplicates or delete the database file."
                ) from None


def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session


Database = Annotated[Session, Depends(get_db)]
