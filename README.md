# Typer - Typing Practice Application

A modern typing practice application built with FastAPI and React.

## 🚀 Features

- User authentication and authorization
- Real-time typing practice
- Performance tracking
- Modern UI with Chakra UI

## 🛠️ Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication

### Frontend
- React
- TypeScript
- Vite
- Chakra UI
- React Router

## 🏗️ Project Structure

```
typing-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── core/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .env
└── README.md
```

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/typer.git
cd typer
```

2. Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/typer
```

3. Start the application using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
