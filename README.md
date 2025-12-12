# FastAPI + React CRUD example

Simple full-stack starter with a FastAPI backend (SQLite + SQLAlchemy) and a React frontend (Vite). The app manages a list of items with create, read, update, and delete operations.

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`.

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```

App will be available at `http://localhost:5173`.

## API quick reference

- `GET /items` — list items
- `POST /items` — create item (title, description?, completed?)
- `GET /items/{id}` — fetch one
- `PUT /items/{id}` — update
- `DELETE /items/{id}` — delete

Ensure the backend is running before starting the frontend so the UI can reach the API.

