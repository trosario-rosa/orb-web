# User Administration API

A small FastAPI backend (Pydantic, SQLAlchemy, SQLite) for creating, listing,
reading and updating users, with optimistic concurrency and a simulated password
reset. No frontend, authentication or email service is included.

## Run

**Docker:**

```bash
docker compose up --build
```

**Python 3.12+:**

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Swagger UI is at http://localhost:8000/docs and the schema at `/openapi.json`.
Tables are created at startup.

Data lives in `data/users.db` locally (override with `DATABASE_PATH`) or in the
`users-data` Docker volume, which `docker compose down --volumes` deletes.

## Project structure

```text
app/
    main.py               # App, startup and error-to-status mapping
    database.py           # SQLite engine and sessions
    models.py             # User table and enums
    schemas.py            # Request/response validation
    errors.py             # Service errors
    services.py           # User queries and updates
    generation.py         # Fake user generation
    user_csv.py           # CSV import and export
    routes/users.py       # User endpoints
    routes/admin_users.py # Reset, generate, import, export
    docs/                 # Swagger page with live generation progress
```

## API

| Method | Path | Success | Purpose |
|---|---|---|---|
| GET | `/users` | 200 | Paginated users and total count |
| GET | `/user/{user_id}` | 200 + ETag | Read one user |
| POST | `/user` | 201 + ETag | Create a user |
| PUT | `/user/{user_id}` | 200 + ETag | Replace all editable fields; requires If-Match |
| POST | `/user/{user_id}/password-reset` | 200 | Simulate a reset request |

POST and PUT require exactly these five fields:

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "role": "Admin",
  "status": "active"
}
```

- **Names:** trimmed, 1–100 characters.
- **Role:** `Admin`, `Member` or `Viewer`. **Status:** `active`, `invited` or `suspended`.
- **Email:** valid syntax, at most 254 characters, and unique ignoring ASCII letter case.

Responses add `id` and three read-only UTC timestamps: `created_at`, `updated_at`
and `last_login` (`null` until a login is recorded; there is no login flow).

| Status | Meaning |
|---|---|
| 404 | Unknown user ID |
| 409 | Email already belongs to another user |
| 412 | If-Match does not match the current ETag |
| 422 | Invalid input, unknown field or malformed UUID |
| 428 | PUT without If-Match |

### Listing

`GET /users` returns `{"items": [...], "total": 500000}`, where `total` counts
all users matching the filters.

| Parameter | Values | Default |
|---|---|---|
| `skip` | 0 or more | 0 |
| `limit` | 1–100 | 25 |
| `sortBy` | Any user field | `id` |
| `direction` | `ascending` or `descending` | `ascending` |
| `role`, `status` | Repeat to select several values | All |
| `q` | Substring of first name, last name or email; at most 254 characters | None |

```http
GET /users?sortBy=created_at&direction=descending&role=Admin&role=Viewer&status=active
GET /users?q=jane&skip=25&limit=25
```

- Values within one filter combine with OR; different filters and `q` combine with AND.
- Search and name/email sorting ignore ASCII letter case. `%` and `_` are literal.
- Ties sort by ID; null `last_login` sorts last. Only one sort field is supported.
- Substring search scans the table, so debounce search requests from a UI.

### ETags

Reading, creating or updating a user returns an `ETag` header such as `"1"`. To update,
send that value, quotes included, as `If-Match`:

- A match saves the user and returns the next ETag. Every successful PUT
  increments it, even if nothing changed.
- A mismatch returns `412` and changes nothing. Fetch the user again and retry
  with the new ETag.

Only one exact quoted ETag is accepted; weak tags, lists and `*` return `412`.
Two updates using the same ETag cannot both succeed.

## Administrative utilities

Unauthenticated, and no If-Match is needed.

| Method | Path | Purpose |
|---|---|---|
| DELETE | `/admin/users/reset` | Delete every user |
| POST | `/admin/users/generate` | Generate fake users, with progress events |
| POST | `/admin/users/import` | Upload CSV; create or overwrite by ID |
| GET | `/admin/users/export` | Download CSV |

```bash
curl -X DELETE http://localhost:8000/admin/users/reset
curl -N -X POST http://localhost:8000/admin/users/generate \
  -H 'Content-Type: application/json' -d '{"count":10000}'
curl -X POST http://localhost:8000/admin/users/import -F 'file=@users.csv'
curl http://localhost:8000/admin/users/export -o users.csv
```

These run in committed batches and are not atomic: a failure or disconnect
leaves earlier batches saved.

### Generate

`count` is a positive integer with no maximum. The response is a
`text/event-stream` with a `progress` event after each batch of up to 5,000
users, then `complete` or `error`:

```text
event: progress
data: {"generated": 5000, "total": 10000}

event: complete
data: {"generated": 10000, "total": 10000}
```

- The HTTP status is 200 once streaming starts, so treat only `complete` as success.
- Use `fetch` and read the body incrementally; `EventSource` cannot send a POST.
- Swagger shows a live counter, progress bar and **Stop generation** button for
  this endpoint.
- Generated users get random names, roles, statuses and timestamps from the last
  two years, with emails like `jandoe1234@example.net`.

### Import

UTF-8 CSV with exactly these columns, in any order:

```csv
id,first_name,last_name,email,role,status,created_at,updated_at,last_login
550e8400-e29b-41d4-a716-446655440000,Jane,Doe,jane.doe@example.com,Admin,active,2025-01-01T09:00:00Z,2025-06-01T12:00:00Z,
```

- New IDs are created; existing IDs are overwritten and their ETag changes.
- Timestamps need `Z` or a UTC offset and must satisfy
  `created_at <= last_login <= updated_at <= now`. Leave `last_login` empty for null.
- Invalid rows, and rows whose email belongs to a different ID, are skipped while
  the rest are saved.
- An invalid header or encoding returns `400`.

```json
{
  "processed": 3,
  "created": 2,
  "updated": 0,
  "rejected": 1,
  "errors": [{"row": 4, "error": "role: Input should be 'Admin', 'Member' or 'Viewer'"}],
  "errors_truncated": 0
}
```

Row numbers count the header as line 1. Only the first 100 errors are returned;
`errors_truncated` counts the rest.

### Export

Streams every user ordered by ID, in the import format, so an export can be
imported directly. Select specific users with repeated `ids` parameters:
unknown IDs are skipped and malformed ones return `422`.

```bash
curl -G http://localhost:8000/admin/users/export \
  --data-urlencode 'ids=550e8400-e29b-41d4-a716-446655440000' -o selected.csv
```

An export is not a snapshot; pause writes if you need a consistent one.

## SQLite limits

- 500,000+ users work through database pagination, but deep offsets, exact
  counts and substring search slow down as the table grows.
- Writes are serialized, and large admin operations share that capacity with
  normal requests. Run a single application process.
- There are no migrations. Startup creates missing tables and indexes only, and
  refuses to start if existing rows contain duplicate emails.
