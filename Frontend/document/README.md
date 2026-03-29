# TalentPulseAI
npm create vite@latest --template react-ts


# TalentPulseAI — Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** March 29, 2026  
**Status:** Active Development — Phase 1 Complete, Phase 2 In Progress

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Architecture Overview](#3-architecture-overview)
4. [Complete User Flow](#4-complete-user-flow)
5. [API Flow Diagram](#5-api-flow-diagram)
6. [Authentication Flow](#6-authentication-flow)
7. [Interview Flow](#7-interview-flow)
8. [Backend Deep Dive](#8-backend-deep-dive)
9. [Frontend Deep Dive](#9-frontend-deep-dive)
10. [API Endpoints Reference](#10-api-endpoints-reference)
11. [Database Schema & Relationships](#11-database-schema--relationships)
12. [Technology Stack](#12-technology-stack)
13. [Development Setup](#13-development-setup)
14. [Environment Variables](#14-environment-variables)
15. [API Management Pattern](#15-api-management-pattern)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [Project Status & Roadmap](#17-project-status--roadmap)
18. [Quick Reference](#18-quick-reference)

---

## 1. Project Overview

**TalentPulseAI** is a full-stack AI-powered mock interview platform that helps job seekers practice, improve, and track their interview performance through realistic AI-driven simulations.

### Key Features

| Feature | Status | Notes |
|---|---|---|
| User Authentication (JWT) | ✅ Complete | Register, login, logout |
| User Profiles | ✅ Complete | Skills, education, preferences |
| Interview Configuration Flow | ✅ Complete | Quick-setup → Role → Profile |
| Interview Session (AI Q&A) | 🔄 Planned | Phase 2 |
| Performance Analytics | 🔄 Planned | Phase 2 |
| Interview History & Reporting | 🔄 Planned | Phase 2 |
| Resume / Document Management | 🔄 Planned | Phase 3 |
| Deployment (Docker) | ❌ Not started | Phase 3 |

---

## 2. Folder Structure

```
TalentPulseAI/
│
├── README.md
├── FLOW_DOCUMENTATION.md
├── API_MANAGEMENT.md
├── docker-compose.yml                  (planned)
│
├── FastAPI-Backend/
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── .env.example
│   ├── Dockerfile                      (planned)
│   │
│   ├── app/
│   │   ├── main.py                     ← FastAPI entry point & CORS
│   │   │
│   │   ├── core/                       ← Config, JWT, security
│   │   │   ├── config.py
│   │   │   ├── jwt.py
│   │   │   └── security.py
│   │   │
│   │   ├── database/                   ← SQLAlchemy engine & session
│   │   │   ├── db.py
│   │   │   └── deps.py
│   │   │
│   │   ├── dependencies/               ← FastAPI dependency injection
│   │   │   └── auth.py
│   │   │
│   │   ├── models/                     ← ORM models (DB tables)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   ├── skill.py
│   │   │   ├── education.py
│   │   │   ├── document.py
│   │   │   ├── preferences.py
│   │   │   └── interview.py            (planned)
│   │   │
│   │   ├── routes/                     ← API endpoint handlers
│   │   │   ├── auth.py                 ✅ done
│   │   │   ├── user.py                 ✅ done
│   │   │   ├── profile.py              ⚠️  empty placeholder
│   │   │   └── interview.py            (planned)
│   │   │
│   │   ├── schemas/                    ← Pydantic request/response models
│   │   │   ├── user_schema.py
│   │   │   └── interview_schema.py     (planned)
│   │   │
│   │   └── services/                   ← Business logic layer
│   │       ├── auth_service.py         ✅ done
│   │       └── interview_service.py    (planned)
│   │
│   └── alembic/
│       ├── env.py
│       ├── script.py.mako
│       └── versions/                   ⚠️  no migrations yet
│
│
└── Frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── .env.local
    ├── index.html
    │
    └── src/
        ├── main.tsx                    ← React entry point
        ├── App.tsx                     ← Router + providers
        ├── index.css
        │
        ├── app/
        │   └── pages/
        │       ├── landing.tsx                     (public)
        │       ├── protected-layout.tsx
        │       │
        │       ├── auth/
        │       │   ├── layout.tsx
        │       │   ├── login.tsx
        │       │   ├── register.tsx
        │       │   └── protected-route.tsx
        │       │
        │       ├── interview/
        │       │   ├── index.tsx
        │       │   ├── quick-setup.tsx             ✅ done
        │       │   ├── select-role.tsx             ✅ done
        │       │   ├── select-profile.tsx          ✅ done
        │       │   ├── session.tsx                 (planned)
        │       │   └── result.tsx                  (planned)
        │       │
        │       ├── dashboard/
        │       │   └── dashboard.tsx               ✅ done
        │       │
        │       └── profile/
        │           └── profile.tsx                 (planned)
        │
        ├── components/
        │   ├── header.tsx
        │   └── ui/                     ← Radix UI + shadcn components
        │       ├── avatar.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── dialog.tsx
        │       ├── dropdown-menu.tsx
        │       ├── form.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       └── separator.tsx
        │
        ├── contexts/
        │   └── auth-context.tsx        ← Global auth state
        │
        ├── lib/
        │   ├── config.ts               ← API base URL & endpoint map
        │   ├── httpClient.ts           ← HTTP wrapper + interceptors
        │   └── utils.ts
        │
        ├── services/
        │   ├── authService.ts
        │   └── interviewService.ts
        │
        └── types/
            ├── api.ts                  ← All request/response types
            └── auth.d.ts
```

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                  │
│                                                           │
│   Pages & Components                                      │
│        ↕                                                  │
│   Custom Hooks & Context (useAuth, AuthProvider)          │
│        ↕                                                  │
│   Service Layer (authService, interviewService)           │
│        ↕                                                  │
│   HTTP Client (httpClient.ts)                             │
│   ┌─ Auth header injection (interceptor)                  │
│   ├─ Timeout management (AbortController)                 │
│   └─ Centralized error handling                           │
└──────────────────────┬───────────────────────────────────┘
                       │  HTTP / JSON
                       ↕
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                         │
│                                                           │
│   Routes (auth.py, user.py, interview.py)                 │
│        ↕                                                  │
│   Services (auth_service.py, interview_service.py)        │
│        ↕                                                  │
│   Models (SQLAlchemy ORM)                                 │
│        ↕                                                  │
│   Database (PostgreSQL)                                   │
└──────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Centralized config** — all API URLs live in `config.ts`, never hard-coded in components
- **Service layer** — components never call `fetch()` directly; they call service functions
- **Type safety** — every API request and response has a TypeScript interface in `types/api.ts`
- **JWT via interceptor** — `httpClient.ts` auto-injects the Bearer token on every request

---

## 4. Complete User Flow

```
START
  │
  ▼
Landing Page (/)  ← Public, no auth required
  │
  ├── "Login" ──────────────────────→ /auth/login
  │                                       │
  └── "Get Started Free" ──────────→ /auth/register
                                          │
                         ┌────────────────┘
                         │  POST /auth/login or /auth/register
                         │  → JWT stored in localStorage
                         ↓
                  /interview/quick-setup   ← Protected (auth required)
                         │
                         │  Step 1: Configure interview parameters
                         │  (difficulty, settings)
                         ↓
                  /interview/select-role
                         │
                         │  Step 2: Choose target role
                         │  (Backend, Frontend, ML, etc.)
                         ↓
                  /interview/select-profile
                         │
                         │  Step 3: Select resume / experience context
                         │  PUT /interview/save/{id}
                         ↓
                  /interview/session        ← PLANNED
                         │
                         │  AI-generated questions
                         │  Video/audio recording
                         │  Real-time analysis
                         │  POST /interview/submit/{id}
                         ↓
                  /interview/result         ← PLANNED
                         │
                         │  Performance score
                         │  Strengths & weaknesses
                         │  AI feedback & improvement tips
                         ↓
                  /dashboard
                         │
                         │  Interview history
                         │  Analytics & trends
                         │  Start new interview
                         ↓
                  /profile                  ← PLANNED
                         │
                         │  Manage resume/skills/education
                         │  Account preferences
                         ↓
                        END
```

---

## 5. API Flow Diagram

Every user interaction travels through this exact chain:

```
User Interaction (click, submit)
        │
        ↓
React Component
        │
        ↓
Custom Hook (useAuth / useInterview)
        │
        ↓
Service Layer (authService / interviewService)
        │
        ↓
TypeScript Type Check (compile-time safety)
        │
        ↓
httpClient.ts
  ├── Add Authorization header (interceptor)
  ├── Set timeout (AbortController)
  └── Stringify request body
        │
        ↓
fetch() → FastAPI Backend
        │
  ├── Validate JWT token
  ├── Parse & validate request body (Pydantic)
  ├── Execute business logic (service layer)
  ├── Query PostgreSQL (SQLAlchemy)
  └── Return JSON response
        │
        ↓
httpClient.ts (response)
  ├── Parse JSON
  ├── Apply response interceptors
  └── Throw typed ApiError on non-2xx
        │
        ↓
Service Layer (return typed data)
        │
        ↓
Hook (setState update)
        │
        ↓
Component re-renders with new data
        │
        ↓
User sees updated UI
```

---

## 6. Authentication Flow

### Login

```
User → /auth/login form
        │
        │  POST /auth/login
        │  { email, password }
        ↓
FastAPI validates credentials
  ├── User exists in DB?  → 401 if not
  ├── bcrypt.verify(password, hash)?  → 401 if fails
  └── Create JWT token (HS256, 30min)
        │
        ↓
Response: { access_token, token_type: "bearer", user }
        │
        ↓
authService.setToken(token)
  → localStorage.setItem("access_token", token)
        │
        ↓
AuthContext updates → isAuthenticated = true
        │
        ↓
navigate("/interview/quick-setup")
```

### Registration

```
User → /auth/register form
        │
        │  POST /auth/register
        │  { full_name, email, phone, password }
        ↓
FastAPI validates input
  ├── Email unique?  → 409 Conflict if taken
  ├── Hash password with bcrypt
  └── Create User + Profile in DB
        │
        ↓
Response: { access_token, token_type, user }
        │
        ↓
Auto-login → same flow as Login above
        │
        ↓
navigate("/interview/quick-setup")
```

### Logout

```
User clicks logout
        │
        ↓
authService.logout()
  ├── POST /auth/logout (notify backend)
  └── localStorage.removeItem("access_token")
        │
        ↓
AuthContext → isAuthenticated = false
        │
        ↓
navigate("/auth/login")
All protected routes now redirect to login
```

### Protected Route Guard

```typescript
// Every protected page is wrapped with:
<ProtectedRoute>
  <PageComponent />
</ProtectedRoute>

// ProtectedRoute logic:
if (isLoading)       → Show spinner
if (!isAuthenticated) → Redirect to /auth/login
else                  → Render children
```

---

## 7. Interview Flow

### Step-by-step with API calls

```
Step 1 — Quick Setup (/interview/quick-setup)
  - Local state only (no API call yet)
  - Collect: difficulty, duration, settings
  - On "Next": POST /interview/start
    Body: { user_id, role, profile_id? }
    Response: InterviewResponse with interview_id
  - Store interview_id in state/context

Step 2 — Select Role (/interview/select-role)
  - Display role cards (Backend, Frontend, ML, etc.)
  - On selection: PUT /interview/save/{id}
    Body: { data: { role } }
  - On "Next": navigate to select-profile

Step 3 — Select Profile (/interview/select-profile)
  - GET /user/profile — fetch user's resume/skills
  - User picks which profile context to use
  - On selection: PUT /interview/save/{id}
    Body: { data: { profile_id, experience } }
  - On "Start Interview": navigate to session

Step 4 — Interview Session (/interview/session)  [PLANNED]
  - Initialize AI question engine
  - Display AI-generated questions one by one
  - Record video/audio response per question
  - Auto-save after each answer:
    PUT /interview/save/{id}
    Body: { data: { answers: { q_id: answer } } }
  - On "Submit": POST /interview/submit/{id}
    Body: { answers: {}, completed_at: ISO string }

Step 5 — Results (/interview/result)  [PLANNED]
  - GET /interview/{id}/results
  - Display: score, feedback, strength/weakness breakdown
  - Option to retry or view in dashboard
```

---

## 8. Backend Deep Dive

### Entry Point — `app/main.py`

```python
app = FastAPI(title="TalentPulseAI API", version="1.0.0")

# CORS — allows frontend at localhost:5173 / 3000
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", ...],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create DB tables on startup
Base.metadata.create_all(bind=engine)

# Register route namespaces
app.include_router(auth.router,  prefix="/auth",  tags=["Auth"])
app.include_router(user.router,  prefix="/user",  tags=["User"])
```

---

### Core Layer — `app/core/`

| File | Purpose |
|---|---|
| `config.py` | Loads `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` from `.env` |
| `jwt.py` | Creates signed JWT tokens using `python-jose` |
| `security.py` | `bcrypt` password hashing and verification |

---

### Database Layer — `app/database/`

```python
# db.py
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# deps.py
def get_db():
    db = SessionLocal()
    try:
        yield db       # FastAPI injects this into routes
    finally:
        db.close()
```

---

### Models — `app/models/`

#### User (Central entity)

```
users
  id            String  PK
  email         String  UNIQUE, indexed
  password_hash String
  created_at    DateTime
  updated_at    DateTime

  → profile      (1:1)
  → skills       (1:N)
  → education    (1:N)
  → documents    (1:N)
  → preferences  (1:1)
  → interviews   (1:N)  [planned]
```

#### Profile (1:1 with User)

```
profiles
  id               String  PK
  user_id          String  FK → users.id (UNIQUE)
  full_name        String
  headline         String?
  phone            String?
  location         String?
  dob              Date?
  nationality      String?
  experience_yrs   Integer?
  bio              String?
  linkedin_url     String?
  github_url       String?
  portfolio_url    String?
  photo_url        String?
  created_at       DateTime
  updated_at       DateTime
```

#### Skill (N:1 with User)

```
skills
  id         String  PK
  user_id    String  FK → users.id
  name       String           (Python, React, etc.)
  level      Integer          (1–5)
  years      Integer?
  category   String           (primary | secondary)
  created_at DateTime
```

#### Education (N:1 with User)

```
education
  id          String  PK
  user_id     String  FK → users.id
  degree      String           (Bachelor, Master, etc.)
  university  String
  field       String
  start_year  Integer
  end_year    Integer?
  grade       String?
  description String?
  created_at  DateTime
```

#### Document (N:1 with User)

```
documents
  id          String  PK
  user_id     String  FK → users.id
  name        String           (original filename)
  type        String           (resume | certificate | other)
  file_url    String           (S3 URL)
  file_key    String           (S3 key for deletion)
  size_kb     Integer
  uploaded_at DateTime
```

#### CareerPreferences (1:1 with User)

```
career_preferences
  id             String  PK
  user_id        String  FK → users.id (UNIQUE)
  preferred_role String?
  location       String?
  job_type       String?          (full-time | intern | contract)
  work_mode      String?          (remote | hybrid | onsite)
  salary_min     Integer?
  salary_max     Integer?
  notice_period  Integer?         (days)
  open_to_work   Boolean
  updated_at     DateTime
```

---

### Services — `app/services/`

#### `auth_service.py`

```python
def signup_user(db, user_data) → User
  - Check email uniqueness (409 if taken)
  - Hash password with bcrypt
  - Create User record
  - Create Profile record
  - Return user

def login_user(db, credentials) → (User, token)
  - Find user by email (401 if not found)
  - Verify password hash (401 if wrong)
  - Generate JWT token
  - Return (user, access_token)
```

---

## 9. Frontend Deep Dive

### React Entry Chain

```
index.html
  └── <div id="root">
        └── main.tsx  → ReactDOM.createRoot().render(<App />)
              └── App.tsx
                    ├── <BrowserRouter>
                    ├── <ThemeProvider>  (dark/light mode)
                    └── <AuthProvider>
                          └── <Routes>
                                ├── /            → <Landing>
                                ├── /auth/login  → <Login>
                                ├── /auth/register → <Register>
                                └── <ProtectedLayout>
                                      ├── /dashboard          → <Dashboard>
                                      ├── /interview          → <QuickSetup>
                                      ├── /interview/quick-setup
                                      ├── /interview/select-role
                                      ├── /interview/select-profile
                                      └── /profile            → <ProfilePage>
```

---

### Auth Context — `src/contexts/auth-context.tsx`

```typescript
interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name, email, phone, password) => Promise<void>
  logout: () => void
}

// Initialization: reads token from localStorage on mount
// Login: calls authService.login() → stores token → navigate()
// Logout: removes token → navigate("/auth/login")
```

---

### HTTP Client — `src/lib/httpClient.ts`

```typescript
class HttpClient {
  // On construction: registers auth interceptor
  constructor(baseURL, timeout) {
    this.addRequestInterceptor(this.injectAuthToken)
  }

  // Interceptor: reads token from localStorage, adds header
  private injectAuthToken(config) {
    const token = localStorage.getItem("access_token")
    if (token) config.headers["Authorization"] = `Bearer ${token}`
    return config
  }

  // All methods support timeout via AbortController
  get<T>(endpoint): Promise<T>
  post<T>(endpoint, data?): Promise<T>
  put<T>(endpoint, data?): Promise<T>
  delete<T>(endpoint): Promise<T>
}

export const httpClient = new HttpClient(
  config.API_BASE_URL,
  config.API_TIMEOUT
)
```

---

### Config — `src/lib/config.ts`

```typescript
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
  API_TIMEOUT: 30000,

  ENDPOINTS: {
    AUTH: {
      LOGIN:    "/auth/login",
      REGISTER: "/auth/register",
      REFRESH:  "/auth/refresh",
      LOGOUT:   "/auth/logout",
      ME:       "/auth/me",
    },
    INTERVIEW: {
      START:   "/interview/start",
      SAVE:    "/interview/save",
      GET:     "/interview/:id",
      SUBMIT:  "/interview/submit",
      RESULTS: "/interview/:id/results",
      LIST:    "/interview/list",
    },
    PROFILE: {
      GET:    "/user/profile",
      UPDATE: "/user/profile/update",
      UPLOAD: "/user/profile/upload",
    },
    SKILLS:    { LIST, ADD, UPDATE, DELETE },
    EDUCATION: { LIST, ADD, UPDATE, DELETE },
  }
} as const
```

---

## 10. API Endpoints Reference

### Authentication

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | ❌ | `{ email, password, full_name, phone? }` | `{ access_token, token_type, user }` |
| POST | `/auth/login` | ❌ | `{ email, password }` | `{ access_token, token_type, user }` |
| POST | `/auth/refresh` | ✅ | — | `{ access_token, token_type, user }` |
| GET | `/auth/me` | ✅ | — | `UserProfile` |
| POST | `/auth/logout` | ✅ | — | `{ message: "Logged out" }` |

### User & Profile

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/user/profile` | ✅ | — | `ProfileResponse` |
| PUT | `/user/profile/update` | ✅ | `{ bio?, title?, company?, location? }` | `ProfileResponse` |
| POST | `/user/profile/upload` | ✅ | `FormData (file)` | `{ url, type, size }` |

### Interview (Planned)

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/interview/start` | ✅ | `{ user_id, role, profile_id? }` | `InterviewResponse` |
| PUT | `/interview/save/{id}` | ✅ | `{ data: { answers, progress } }` | `InterviewResponse` |
| GET | `/interview/{id}` | ✅ | — | `InterviewResponse` |
| GET | `/interview/list` | ✅ | `?page=1&page_size=10` | `PaginatedResponse<InterviewResponse>` |
| POST | `/interview/submit/{id}` | ✅ | `{ answers, completed_at }` | `InterviewResponse` |
| GET | `/interview/{id}/results` | ✅ | — | `{ score, feedback, insights }` |

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 401 | Unauthorized (wrong credentials or missing token) |
| 409 | Conflict (email already registered) |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |

---

## 11. Database Schema & Relationships

```
                    ┌──────────────┐
                    │    Users     │
                    │  (id, email) │
                    └──────┬───────┘
           ┌───────────────┼────────────────┬──────────────┐
           │               │                │              │
         1:1             1:N              1:N            1:1
           │               │                │              │
      ┌────┴─────┐  ┌──────┴──────┐  ┌─────┴──────┐  ┌───┴──────────────┐
      │ Profiles │  │   Skills    │  │  Education  │  │ CareerPreferences │
      └──────────┘  └─────────────┘  └────────────┘  └──────────────────┘
           │
         1:N
           │
      ┌────┴────────┐
      │  Documents  │
      └─────────────┘
           │
         (future)
           │
      ┌────┴─────────┐
      │  Interviews  │
      └──────────────┘
```

**Relationship summary:**

| Model | Relationship | Count |
|---|---|---|
| User → Profile | 1:1 | One user, one extended profile |
| User → Skills | 1:N | A user can have many skills |
| User → Education | 1:N | A user can have many degrees |
| User → Documents | 1:N | A user can upload many files |
| User → CareerPreferences | 1:1 | One set of job preferences |
| User → Interviews | 1:N | A user can do many interviews |

---

## 12. Technology Stack

### Backend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | FastAPI | 0.110.0 | REST API |
| Server | Uvicorn | 0.27.1 | ASGI server |
| ORM | SQLAlchemy | 2.0.25 | Database abstraction |
| Database | PostgreSQL | — | Data persistence |
| Auth | python-jose | 3.3.0 | JWT tokens |
| Hashing | bcrypt | 3.2.2 | Password security |
| Validation | Pydantic | 2.6.4 | Request/response schemas |
| Migration | Alembic | — | DB schema migrations |

### Frontend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 19.2.0 | UI library |
| Router | React Router | 7.10.1 | Client routing |
| Language | TypeScript | 5.9.3 | Type safety |
| Bundler | Vite | 7.2.4 | Dev server & builds |
| Styling | Tailwind CSS | 3.4.18 | Utility-first CSS |
| Animation | Framer Motion | 12.23.26 | UI animations |
| Components | Radix UI / shadcn | — | Headless accessible UI |
| Forms | React Hook Form + Zod | 7.68.0 / 4.1.13 | Form state & validation |
| Charts | Recharts | 3.5.1 | Analytics visualization |

---

## 13. Development Setup

### Backend

```bash
# Navigate to backend
cd FastAPI-Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run migrations (after creating them)
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Useful backend commands:**

```bash
# Create new migration
alembic revision --autogenerate -m "add interview table"

# Run all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View API docs
open http://localhost:8000/docs       # Swagger UI
open http://localhost:8000/redoc      # ReDoc
```

---

### Frontend

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Create local env file
cp .env.example .env.local
# Set VITE_API_URL=http://127.0.0.1:8000

# Start dev server
npm run dev
# → http://localhost:5173
```

**Useful frontend commands:**

```bash
npm run dev          # Start dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check (no emit)
```

---

### Dev Server URLs

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (FastAPI) | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## 14. Environment Variables

### Backend — `FastAPI-Backend/.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/talentpulseai
SECRET_KEY=your-super-secret-key-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend — `Frontend/.env.local`

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=TalentPulseAI
VITE_DEBUG_MODE=true
```

> `.env.local` is gitignored. Never commit secrets.

---

## 15. API Management Pattern

This project uses a **3-layer API management pattern** to prevent scattered `fetch()` calls.

```
Components / Hooks
      ↓
Services (authService, interviewService)
      ↓
httpClient (single HTTP wrapper)
      ↓
Backend
```

### Rule: Always use service functions, never raw fetch

```typescript
// ❌ Wrong — direct fetch in component
const res = await fetch("http://127.0.0.1:8000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
})

// ✅ Correct — use the service layer
const response = await authService.login({ email, password })
```

### Rule: Always use config for endpoint URLs

```typescript
// ❌ Wrong — string literal
const url = "/auth/login"

// ✅ Correct — from config
import { config } from "@/lib/config"
const url = config.ENDPOINTS.AUTH.LOGIN
```

### Rule: Always use typed responses

```typescript
// ❌ Wrong — any type
const response: any = await api.call()

// ✅ Correct — specific interface
const response: AuthResponse = await authService.login(credentials)
```

---

## 16. Error Handling Strategy

### ApiError interface

```typescript
interface ApiError {
  status: number        // HTTP status code
  detail: string        // Human-readable message
  timestamp: string     // ISO timestamp
  path?: string         // Request path
}
```

### Error handling pattern

```typescript
try {
  const response = await authService.login({ email, password })
  // Success — use response.access_token
} catch (error) {
  const apiError = error as ApiError

  switch (apiError.status) {
    case 401: showError("Invalid email or password"); break
    case 409: showError("Email already exists"); break
    case 422: showError("Please check your input"); break
    case 500: showError("Server error — try again later"); break
    default:  showError(apiError.detail ?? "An error occurred")
  }
}
```

### Global interceptor for cross-cutting concerns

```typescript
httpClient.addErrorInterceptor((error: ApiError) => {
  // Log to analytics
  console.error(`API Error: ${error.status} — ${error.detail}`)

  // Token expired → force re-login
  if (error.status === 401) {
    window.location.href = "/auth/login"
  }

  return error
})
```

---

## 17. Project Status & Roadmap

### Current Status

| Component | Status | Completion |
|---|---|---|
| Backend — Core Auth | ✅ Complete | 100% |
| Backend — User Profile | ✅ Complete | 100% |
| Backend — Database Models | ✅ Complete | 100% |
| Backend — Interview Endpoints | 🔄 Planned | 0% |
| Frontend — Auth Pages | ✅ Complete | 100% |
| Frontend — Interview Setup Flow | ✅ Complete | 100% |
| Frontend — Dashboard | ✅ Complete | 100% |
| Frontend — Interview Session | 🔄 Planned | 0% |
| Frontend — Results Page | 🔄 Planned | 0% |
| Frontend — Profile Page | 🔄 Planned | 0% |
| DB Migrations (Alembic) | ⚠️ Not run yet | — |
| Deployment (Docker) | ❌ Not started | 0% |

---

### Immediate Next Steps (Phase 2)

- [ ] Create Alembic migration files and run `alembic upgrade head`
- [ ] Build `app/models/interview.py` ORM model
- [ ] Build `app/routes/interview.py` endpoints (start, save, submit, results, list)
- [ ] Build `app/services/interview_service.py` business logic
- [ ] Build `app/schemas/interview_schema.py` Pydantic schemas
- [ ] Build `/interview/session` frontend page with AI question flow
- [ ] Build `/interview/result` frontend page with score display
- [ ] Integrate AI question generation (OpenAI or Anthropic API)
- [ ] Add video/audio recording to session page
- [ ] Build `/profile` frontend page with skill/education management

### Phase 3

- [ ] Analytics dashboard with Recharts visualizations
- [ ] Document upload to S3-compatible storage
- [ ] Email notifications (interview summary)
- [ ] Docker + docker-compose setup
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring & logging (e.g. Sentry)
- [ ] Caching layer (Redis)

---

## 18. Quick Reference

### Import cheat sheet

```typescript
// Config & HTTP
import { config, buildUrl }           from "@/lib/config"
import { httpClient }                  from "@/lib/httpClient"

// Types
import type { AuthResponse, InterviewResponse, ApiError } from "@/types/api"

// Services
import { authService }                 from "@/services/authService"
import { interviewService }            from "@/services/interviewService"

// Auth hook
import { useAuth }                     from "@/contexts/auth-context"
```

### Common operations

```typescript
// Check if logged in
authService.isAuthenticated()

// Login
await authService.login({ email, password })

// Get stored user
authService.getCurrentUserFromStorage()

// Start interview
const interview = await interviewService.startInterview({
  user_id: "123",
  role: "backend-engineer",
})

// Save progress
await interviewService.saveProgress(interview.id, {
  answers: { q1: "my answer" },
  timestamp: new Date().toISOString(),
})

// Submit
await interviewService.submitInterview(interview.id, {
  answers,
  completed_at: new Date().toISOString(),
})

// Get results
const results = await interviewService.getResults(interview.id)
console.log(results.score, results.feedback)
```

### File locations at a glance

| What you need | File |
|---|---|
| API entry point & CORS | `FastAPI-Backend/app/main.py` |
| JWT & password security | `FastAPI-Backend/app/core/` |
| DB connection & session | `FastAPI-Backend/app/database/db.py` |
| All ORM table definitions | `FastAPI-Backend/app/models/` |
| Auth route handlers | `FastAPI-Backend/app/routes/auth.py` |
| Auth business logic | `FastAPI-Backend/app/services/auth_service.py` |
| React app router | `Frontend/src/App.tsx` |
| Auth state (context) | `Frontend/src/contexts/auth-context.tsx` |
| All API endpoint URLs | `Frontend/src/lib/config.ts` |
| HTTP wrapper | `Frontend/src/lib/httpClient.ts` |
| TypeScript API types | `Frontend/src/types/api.ts` |
| Auth service | `Frontend/src/services/authService.ts` |
| Interview service | `Frontend/src/services/interviewService.ts` |

---

**Document Version:** 1.0.0  
**Scope:** Complete project structure, flows, and implementation guide  
**Maintained by:** Development Team