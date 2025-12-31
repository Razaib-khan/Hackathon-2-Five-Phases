---
title: AIDO Todo API
emoji: ✅
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# AIDO - AI-Powered Interactive Task Manager

A modern, full-stack task management application with JWT authentication, built with:
- **Frontend:** Next.js 15 (React 19) + TypeScript + Tailwind CSS
- **Backend:** FastAPI + PostgreSQL (Neon)
- **Deployment:** GitHub Pages + Hugging Face Spaces + Docker

## 🚀 Live Deployments

| Service | URL |
|---------|-----|
| **Frontend** | https://razaib-khan.github.io/Hackathon-2-Five-Phases/ |
| **Backend API** | https://huggingface.co/spaces/Razaib123/aido-todo-api |
| **Repository** | https://github.com/Razaib-khan/Hackathon-2-Five-Phases |

## 📋 Features

### Frontend
- 🎨 Modern UI with Tailwind CSS
- 🔐 JWT Authentication (Login/Register)
- ✏️ Create, Read, Update, Delete tasks
- 🔍 Search and filter tasks
- 📱 Responsive design
- ⚡ Real-time updates

### Backend
- 🔒 Secure JWT-based authentication
- 📊 PostgreSQL database integration
- 🚀 FastAPI with async support
- 📝 RESTful API endpoints
- ✅ Input validation with Pydantic
- 🛡️ CORS enabled

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15.5.9
- React 19
- TypeScript
- Tailwind CSS
- Next.js App Router

**Backend:**
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- PostgreSQL (Neon)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions
- GitHub Pages
- Hugging Face Spaces

## 📦 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose

### Quick Start

**Using Docker:**
```bash
docker-compose up
```

**Manual Setup:**

Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload
# Runs on http://localhost:8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create task
- `GET /tasks/{id}` - Get task details
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Health
- `GET /health` - Health check

## 🔐 Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql+psycopg://user:password@host/db
JWT_SECRET=your-secret-key
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Deployment

### GitHub Pages (Frontend)
- **Trigger:** Push to `main` (frontend/*)
- **Workflow:** `.github/workflows/deploy-github-pages.yml`
- **URL:** https://razaib-khan.github.io/Hackathon-2-Five-Phases/

### Hugging Face Spaces (Backend)
- **Trigger:** Push to `main` (backend/*)
- **Workflow:** `.github/workflows/deploy-huggingface.yml`
- **URL:** https://huggingface.co/spaces/Razaib123/aido-todo-api
- **Docker:** Automatically built and deployed

### Local Docker
```bash
# Build and run
docker-compose up --build

# Services
Frontend: http://localhost:3000
Backend: http://localhost:8000
Database: localhost:5432
```

## 📊 Project Structure

```
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities (auth, API)
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── src/
│   │   ├── main.py          # App entry point
│   │   ├── api/             # Route handlers
│   │   ├── db/              # Database setup
│   │   ├── models/          # SQLAlchemy models
│   │   └── schemas/         # Pydantic schemas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # Local dev stack
└── README.md                # This file
```

## 🔄 CI/CD Workflows

1. **Frontend CI/CD** - Lint, test, build, security scan
2. **GitHub Pages** - Static site deployment
3. **Hugging Face** - Docker backend deployment

## 📝 Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Unit tests
```

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## 🧪 Testing

```bash
# Frontend
npm test

# Backend
pytest backend/tests/
```

## 🔒 Security

- ✅ JWT authentication with secure tokens
- ✅ Password hashing (bcrypt)
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Input validation (Pydantic)
- ✅ SQL injection protection (SQLAlchemy)

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Razaib Khan** - [@Razaib123](https://huggingface.co/Razaib123)

## 🤝 Contributing

Contributions welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- **GitHub Issues:** https://github.com/Razaib-khan/Hackathon-2-Five-Phases/issues
- **Hugging Face Space:** https://huggingface.co/spaces/Razaib123/aido-todo-api

---

**Made with ❤️ for the Hackathon**
