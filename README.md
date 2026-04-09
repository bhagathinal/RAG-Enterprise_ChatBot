# RAG Enterprise ChatBot — Aria AI Assistant

An enterprise-grade **Retrieval-Augmented Generation (RAG)** system that lets employees query internal company policy documents through a conversational AI assistant named **Aria**. Built with Angular 21, Node.js/Express, MongoDB, and the Groq LLM API.

---

## ✨ Features

- 🤖 **Aria AI Assistant** — Named AI chatbot with a branded UI, starter prompts, and source citations
- 📄 **RAG Pipeline** — PDFs are chunked and indexed into MongoDB; relevant chunks are retrieved per query and fed to the LLM
- 🔐 **JWT Authentication** — Secure signup/login with bcrypt-hashed passwords
- 📊 **HR Dashboard** — KPI metrics (leave balance, tenure, attendance), company announcements, and recent Aria sessions
- 📋 **Policy Library** — Browse all indexed company documents
- 💬 **Chat History** — Past conversations are persisted in MongoDB and restored on login
- 🌐 **Angular 21 SPA** — Standalone components, signals, reactive forms

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Angular Signals, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (`policyhub` database) |
| AI / LLM | Groq API (LLaMA 3) |
| PDF Parsing | pdf-parse v2 (`PDFParse` class) |
| Auth | JWT + bcryptjs |

---

## 📁 Project Structure

```
RAG_Enterprise/
├── client/                   # Angular 21 frontend
│   └── src/
│       ├── app/
│       │   ├── core/services/    # AuthService
│       │   ├── features/
│       │   │   ├── chat/         # Aria chat interface
│       │   │   └── dashboard/    # HR dashboard + policy list
│       │   └── app.routes.ts
│       └── environments/
│           ├── environment.ts          # Development config
│           └── environment.production.ts  # Production config
│
├── server/                   # Express.js backend
│   ├── src/
│   │   ├── config/           # DB connection
│   │   ├── middleware/        # Auth middleware
│   │   ├── models/
│   │   │   ├── User.js        # User schema (bcrypt hashed passwords)
│   │   │   ├── PolicyChunk.js # Indexed PDF text chunks
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── auth.js        # POST /api/auth/signup, /login
│   │   │   ├── policy.js      # POST /api/policies/chat, GET /history
│   │   │   └── hr.js          # GET /api/hr/stats, /announcements
│   │   ├── services/
│   │   │   └── ragService.js  # PDF ingestion + RAG query pipeline
│   │   └── server.js
│   ├── .env                  # Environment variables (not committed)
│   └── package.json
│
└── Data/                     # Source PDF policy documents
    ├── Annual-Report-2024-25.pdf
    ├── Employee-Handbook.pdf
    ├── Leave-and-Holiday-Policy.pdf
    ├── Privacy_and_terms.pdf
    └── Technical-Documentation.pdf
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 20
- MongoDB running locally
- A [Groq API key](https://console.groq.com/)

### 1. Clone the repo

```bash
git clone https://github.com/bhagathinal/RAG-Enterprise_ChatBot.git
cd RAG-Enterprise_ChatBot
```

### 2. Configure the server environment

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/policyhub
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ The server will start without a `GROQ_API_KEY` but Aria's AI responses will be disabled until one is provided.

### 3. Install & start the backend

```bash
cd server
npm install
npm start
```

On startup, the server will automatically ingest all PDFs from the `Data/` folder into the `policychunks` collection in MongoDB.

### 4. Install & start the frontend

```bash
cd client
npm install
npm start
```

The app will be available at **`http://localhost:4200`**.

---

## 🗄️ Database

**Database:** `policyhub` (MongoDB)

| Collection | Description |
|------------|-------------|
| `users` | User accounts (name, email, bcrypt-hashed password, HR stats) |
| `policychunks` | Text chunks extracted from PDFs (title, text, filename) |
| `conversations` | Aria chat session history per user |
| `announcements` | HR announcements shown on dashboard |
| `policycategories` | Policy document metadata |
| `policydocuments` | Policy document records |

---

## 🤖 How the RAG Pipeline Works

1. **Ingestion** — On server start, PDFs in `Data/` are parsed using `pdf-parse` v2, split into chunks (paragraphs > 100 chars), and stored in `policychunks`
2. **Retrieval** — On a user query, relevant chunks are fetched from MongoDB using text search
3. **Generation** — Retrieved chunks are passed as context to the Groq LLM (LLaMA 3), which generates a grounded answer with source citations

---

## 🔐 Authentication Flow

1. User signs up / logs in via `/api/auth/signup` or `/api/auth/login`
2. Server returns a **JWT token** (stored in `localStorage`)
3. All subsequent API calls include `Authorization: Bearer <token>`
4. Token is validated server-side via auth middleware

---

## 📜 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/policies/chat` | Send a query to Aria |
| GET | `/api/policies/chat/history` | Get chat history |
| GET | `/api/policies/list` | List all indexed policies |
| GET | `/api/hr/stats` | Get HR metrics for current user |
| GET | `/api/hr/announcements` | Get company announcements |

---

## 🧑‍💻 Development Notes

- The Angular build uses `@angular/build:application` (esbuild) with `moduleResolution: bundler`
- Environment files live in `client/src/environments/` — `environment.ts` for dev, `environment.production.ts` for prod
- The `defaultConfiguration` in `angular.json` is set to `development` for `ng serve`
