# Archiver Backend

This directory contains the Python backend that drives the Archiver application. It is a FastAPI application that interfaces with the local macOS Messages database.

## Architecture
- **Framework**: FastAPI
- **Database**: SQLite (local `chat.db`)
- **Key Modules**:
  - `src/app.py`: Main API server.
  - `src/engine.py`: Core logic for archiving & file processing.
  - `src/db.py`: Database queries and metadata management.

## Setup
Dependencies are listed in `requirements.txt`.

```bash
pip install -r requirements.txt
```

## Running Standalone
You can run the backend independently for testing purposes:

```bash
python3 src/app.py
```
This will start the API server at `http://127.0.0.1:8000`.

## API Endpoints
- `GET /system/status`: Check system status.
- `GET /stats/global`: Global message statistics.
- `GET /chats/recent`: List recent conversations.
- `GET /chats/{guid}/messages`: Retrieve messages for a chat.
- `POST /chats/{guid}/archive`: Trigger an archive job for a chat.
