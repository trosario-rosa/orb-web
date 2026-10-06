# Orb Web

A user administration application: a React frontend backed by a FastAPI service.

[Retrospective README](docs/retrospective.md)

## Prerequisites

- Docker
- Docker Compose

## Getting Started

Clone the repository, then start the app from the project root:

```bash
docker compose up --build -d
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:8000 |

Stop the app:

```bash
docker compose down
```

User data is stored in a Docker volume. Add `--volumes` to the command above to delete it.

## Project Structure

| Path                   | Description                            |
| ---------------------- | -------------------------------------- |
| [frontend/](frontend/) | React, TypeScript, Vite and Material UI |
| [backend/](backend/)   | FastAPI, SQLAlchemy and SQLite          |
| [docs/](docs/)         | Assignment brief and project notes      |

To run, lint or test a service without Docker, see its own README.
