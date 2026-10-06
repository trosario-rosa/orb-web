from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.database import engine, init_db
from app.errors import EmailInUse, InvalidImport, ServiceError, UserNotFound, VersionMismatch, VersionRequired
from app.routes.admin_users import router as admin_router
from app.routes.users import router

STATUS_CODES = {InvalidImport: 400, UserNotFound: 404, EmailInUse: 409, VersionMismatch: 412, VersionRequired: 428}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_db()
    try:
        yield
    finally:
        engine.dispose()


app = FastAPI(title="User Administration API", lifespan=lifespan, docs_url=None, redoc_url=None)
app.include_router(router)
app.include_router(admin_router)


@app.exception_handler(ServiceError)
def service_error(request: Request, error: ServiceError) -> JSONResponse:
    return JSONResponse({"detail": str(error)}, status_code=STATUS_CODES[type(error)])


docs_directory = Path(__file__).parent / "docs"
app.mount("/docs-assets", StaticFiles(directory=docs_directory), name="docs-assets")


@app.get("/docs", include_in_schema=False)
def swagger_docs() -> FileResponse:
    return FileResponse(docs_directory / "index.html", headers={"Cache-Control": "no-cache"})
