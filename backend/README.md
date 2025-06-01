# Typer Backend

This is the backend service for the Typer application, built with FastAPI and PostgreSQL.

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── api/             # API endpoints
│   │   └── v1/         # API version 1
│   ├── core/           # Core functionality
│   ├── db/             # Database models and session
│   └── main.py         # FastAPI application
├── requirements.txt     # Python dependencies
└── Dockerfile          # Docker configuration
```

## Setup

1. Make sure you have Docker and Docker Compose installed
2. Create a `.env` file in the backend directory (optional, for local development)
3. Run the application using Docker Compose:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the application is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Migrations

To create a new migration:

```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
```

To apply migrations:

```bash
docker-compose exec backend alembic upgrade head
``` 