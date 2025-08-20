# orgChart

Corporate organizational chart built with **Go (backend)** and **React + Vite + Tailwind (frontend)**, fully dockerized with **Docker Compose**.

## 📌 Overview

This project provides:
- Go backend with GORM + SQLite
- React (Vite + Tailwind) admin frontend
- Hierarchical employee visualization (org chart)
- CRUD for teams and employees
- Simplified deployment with Docker

---

## 🚀 Features

- **Teams**
  - Create teams
  - List teams

- **Employees**
  - Create employees
  - Edit employees
  - Assign to teams and managers
  - List employees in a table
  - Visualize hierarchy

- **Infrastructure**
  - Persistent SQLite database
  - Separate containers for backend (API) and frontend (Nginx)
  - Internal proxy via Nginx (`/api/` → backend)

---

## 📂 Project structure

```
orgChart/
├── backend/                 # Go backend
│   ├── cmd/server/main.go   # API entrypoint
│   ├── internal/            # models, db, logic
│   ├── go.mod / go.sum
│   └── Dockerfile           # API Dockerfile
│
├── web/                     # React frontend
│   ├── src/                 # React components
│   ├── public/
│   ├── package.json
│   ├── nginx.conf           # frontend → backend proxy
│   └── Dockerfile           # frontend Dockerfile
│
├── data/                    # SQLite persistent volume
│   └── (orgchart.db)
│
├── docker-compose.yml       # Compose orchestration
└── README.md                # This file
```

---

## 🛠️ Requirements

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)

---

## 🔧 Running locally (without Docker)

### Backend (Go)
```bash
cd backend
go run ./cmd/server
```

Default API runs at **http://localhost:8080/api/v1**

### Frontend (React + Vite)
```bash
cd web
npm install
npm run dev
```

Default frontend runs at **http://localhost:5173**.  
Configure `VITE_API_URL` in `.env` if the API is hosted elsewhere.

---

## 🐳 Running with Docker

### Build and start
From project root:
```bash
docker compose up --build
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- API: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

### Service layout
- `api`: Go + SQLite (volume mounted at `./data`)
- `web`: Nginx serving React, proxying requests to `api`

### Persistence
SQLite database (`orgchart.db`) is stored in `./data` on the host and mounted inside the container.

---

## ⚙️ Environment variables

### Backend
- `DB_PATH` — path to SQLite database (default: `/data/orgchart.db`)

### Frontend
- `VITE_API_URL` — base API URL (default: `/api/v1` when using docker/nginx)

---

## 🧩 Key Endpoints

### Healthcheck
```
GET /api/v1/healthz
```

### Teams
```
GET    /api/v1/teams
POST   /api/v1/teams
```

### Employees
```
GET    /api/v1/employees
POST   /api/v1/employees
PUT    /api/v1/employees/:id
DELETE /api/v1/employees/:id
```

---

## 📖 Seed scripts (optional)

You can create `backend/internal/db/seed.go` to insert initial data (teams/employees) and call it in `Init()` if the database is empty.

---

## 📌 TODO / Roadmap

- [ ] Authentication (JWT)
- [ ] Employee avatar upload
- [ ] Automated deployment (Render, Railway, etc.)
- [ ] Unit and integration tests

---

## 👨‍💻 Authors

- **[@vernieri](https://github.com/vernieri)** — Original project and maintenance
