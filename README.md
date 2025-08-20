# orgChart

Organograma corporativo feito em **Go (backend)** e **React + Vite + Tailwind (frontend)**, com suporte a **Docker Compose** para rodar tudo em um único comando.

## 📌 Visão geral

Este projeto fornece:
- API backend em Go + GORM + SQLite
- Frontend administrativo em React (Vite + Tailwind)
- Visualização hierárquica de funcionários (organograma)
- CRUD de times e funcionários
- Deploy simplificado com Docker

---

## 🚀 Funcionalidades

- **Times**
  - Criar times
  - Listar times

- **Funcionários**
  - Criar funcionários
  - Editar funcionários
  - Associar a times e líderes
  - Listagem em tabela
  - Visualização hierárquica

- **Infraestrutura**
  - Banco SQLite persistente
  - Containers separados para backend (API) e frontend (Nginx)
  - Proxy interno via Nginx (`/api/` → backend)

---

## 📂 Estrutura do projeto

```
orgChart/
├── backend/                 # Código Go
│   ├── cmd/server/main.go   # entrypoint da API
│   ├── internal/            # models, db e lógica
│   ├── go.mod / go.sum
│   └── Dockerfile           # build da API
│
├── web/                     # Frontend React
│   ├── src/                 # componentes React
│   ├── public/
│   ├── package.json
│   ├── nginx.conf           # proxy frontend → backend
│   └── Dockerfile           # build do frontend
│
├── data/                    # Volume persistente do SQLite
│   └── (orgchart.db)
│
├── docker-compose.yml       # Orquestração API + Front
└── README.md                # Este documento
```

---

## 🛠️ Requisitos

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)

---

## 🔧 Rodando localmente (sem Docker)

### Backend (Go)
```bash
cd backend
go run ./cmd/server
```

Por padrão a API sobe em **http://localhost:8080/api/v1**

### Frontend (React + Vite)
```bash
cd web
npm install
npm run dev
```

Por padrão o frontend roda em **http://localhost:5173**.  
Configure a variável `VITE_API_URL` em `.env` se a API estiver em outra URL.

---

## 🐳 Rodando com Docker

### Build e subir
Na raiz do projeto:
```bash
docker compose up --build
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- API: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

### Estrutura dos serviços
- `api`: container Go + SQLite (volume montado em `./data`)
- `web`: container Nginx servindo o React, com proxy para `api`

### Persistência
O banco SQLite (`orgchart.db`) fica em `./data` no host e é montado no container.

---

## ⚙️ Variáveis de ambiente

### Backend
- `DB_PATH` — caminho do banco SQLite (default: `/data/orgchart.db`)

### Frontend
- `VITE_API_URL` — URL base da API (default: `/api/v1` quando rodando via docker/nginx)

---

## 🧩 Endpoints principais

### Healthcheck
```
GET /api/v1/healthz
```

### Times
```
GET    /api/v1/teams
POST   /api/v1/teams
```

### Funcionários
```
GET    /api/v1/employees
POST   /api/v1/employees
PUT    /api/v1/employees/:id
DELETE /api/v1/employees/:id
```

---

## 📖 Scripts de seed (opcional)

Você pode criar um arquivo `backend/internal/db/seed.go` para inserir dados iniciais (times/funcionários) e chamar no `Init()` caso o banco esteja vazio.

---

## 📌 TODO / Roadmap

- [ ] Autenticação (JWT)
- [ ] Upload de avatar para funcionários
- [ ] Deploy automatizado (Render, Railway, etc.)
- [ ] Tests (unitários e integração)

---

## 👨‍💻 Autores

- **[@vernieri](https://github.com/vernieri)** — Projeto original e manutenção
