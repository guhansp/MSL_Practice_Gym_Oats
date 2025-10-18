# DNATE MSL Practice Gym

**AI-driven Practice & Performance Dashboard for Medical Science Liaisons**

A full-stack web application that empowers Medical Science Liaisons (MSLs) to practice conversations, explore expert responses, and visualize performance trends across personas and therapeutic categories.

## 🎯 Overview

DNATE MSL Practice Gym provides an AI-augmented, data-driven environment where MSLs can:

- 🗣️ Practice real-world question scenarios with dynamic personas
- 📊 View interactive dashboards tracking confidence and category trends
- 📈 Analyze performance by persona and communication category
- 📚 Study expert sample responses based on STAR, LEAP, CAR frameworks
- 🔒 Manage personal progress through a secure, modern interface

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **API Auth** | JWT (JSON Web Token) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Styling** | Tailwind + Custom DNATE Theme |
| **Package Manager** | npm |

## 🚢 Deployment

The application is deployed using the following infrastructure:

| Component | Platform | Purpose |
|-----------|----------|---------|
| **Frontend** | Vercel | React application hosting |
| **Backend** | Railway | Node.js API server |
| **Database** | Supabase | PostgreSQL database |

## 📁 Folder Structure

```
DNATE-MSL-Practice-Gym/
│
├── backend/
│   ├── db/
│   │   └── config.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── personaRoutes.js
│   ├── middleware/
│   │   └── authValidate.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   └── MetricCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PersonasPage.jsx
│   │   │   ├── PersonaDetailPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SampleResponses.jsx
│   │   │   └── QuestionsPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── dashboardService.js
│   │   │   └── personaService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── Logo.svg
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://<USER>:<PASSWORD>@localhost:5432/dnate_db
JWT_SECRET=<your_jwt_secret>
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/dnate-msl-practice-gym.git
cd dnate-msl-practice-gym
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file (see above), then initialize the database:
```sql
CREATE DATABASE dnate_db;
```

Start the server:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
Frontend runs at `http://localhost:5173`

## ✨ Key Features

### 📊 Dashboard
- View total sessions, streaks, and confidence heatmaps
- Analyze category-based confidence via interactive charts
- Visualize confidence trends (1m, 3m, 6m views)

### 👥 Personas
- Browse personas (Oncologist, Cardiologist, Neurologist)
- Explore communication style, motivations, and question patterns
- Launch practice sessions from a persona profile

### 👤 Profile Page
- Manage profile and organization details
- Change password securely
- Track performance metrics by category and persona

### 📝 Sample Responses
- Expert-crafted responses using STAR, CAR, LEAP frameworks
- Key talking points and structured reasoning
- Compare your answers with expert examples

## 🔐 Authentication Flow

1. Login via `/auth/login`
2. JWT stored in `localStorage`
3. Axios interceptor attaches token to requests
4. Backend validates token on protected routes

### Axios Interceptor (`/frontend/src/services/api.js`)
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dnate_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `GET` | `/api/auth/me` | Fetch logged-in user details |
| `PATCH` | `/api/auth/me` | Update user profile |
| `POST` | `/api/auth/change-password` | Update user password |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | Get all user sessions |
| `POST` | `/api/sessions` | Create new session |
| `PATCH` | `/api/sessions/:id/complete` | Mark a session as completed |
| `GET` | `/api/sessions/stats` | Retrieve dashboard statistics |

### Personas
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/personas` | Get all personas |
| `GET` | `/api/personas/:id` | Get persona details |

### Example `/sessions/stats` Response
```json
{
  "totalSessions": 42,
  "completedSessions": 38,
  "avgConfidence": 4.1,
  "currentStreak": 7,
  "categoryBreakdown": [
    { "category": "Clinical Data & Evidence", "count": 10, "avg_confidence": 4.4 },
    { "category": "Cost & Value", "count": 8, "avg_confidence": 3.9 }
  ],
  "personaBreakdown": [
    { "persona_name": "Oncologist", "count": 16, "avg_confidence": 4.2 },
    { "persona_name": "Cardiologist", "count": 14, "avg_confidence": 4.0 }
  ]
}
```

## 🗄️ Database Schema (PostgreSQL)

```sql
-- USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  organization VARCHAR(150),
  role VARCHAR(50) DEFAULT 'msl',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- PERSONAS
CREATE TABLE personas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  title VARCHAR(150),
  specialty VARCHAR(150),
  communication_style JSONB,
  priorities TEXT[],
  challenges TEXT[],
  quote TEXT
);

-- QUESTIONS
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  persona_id INT REFERENCES personas(id),
  category VARCHAR(100),
  question TEXT,
  difficulty VARCHAR(50),
  estimated_response_time INT
);

-- SESSIONS
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  persona_id INT REFERENCES personas(id),
  category VARCHAR(100),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  confidence_rating DECIMAL(2,1),
  status VARCHAR(50) DEFAULT 'in_progress'
);
```

## 🎨 DNATE Brand Design System

| Element | Value |
|---------|-------|
| **Primary Blue** | `#0375E9` |
| **Indigo Base** | `#18202D` |
| **Graphite Text** | `#505A69` |
| **Gray Accent** | `#F5F7FB` |
| **Font (Sans)** | Manrope |
| **Font (Serif)** | Domine |

All components (NavBar, Cards, Metrics, Tables) follow DNATE's brand typography, spacing, and color system.

## 🚢 Deployment

### Frontend (Vercel)

1. Import repository
2. Framework: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: `VITE_API_URL=https://<backend-host>/api`
6. Deploy from `main` (or chosen branch)

### Backend (Railway)

#### Railway
- Deploy from repo (service root `/backend`)
- Env: `PORT`, `DATABASE_URL`, `JWT_SECRET`
- Add PostgreSQL plugin and map to `DATABASE_URL`

### Database (Supabase)

1. Create new project in Supabase
2. Copy connection string from project settings
3. Run database migrations/schema setup
4. Update `DATABASE_URL` in Railway backend environment
5. Connection string format:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
   
### CORS & Health Check
```javascript
// server.js
import cors from "cors";
app.use(cors({ origin: ["https://<your-vercel-domain>"], credentials: true }));
app.get("/api/health", (_, res) => res.json({ ok: true }));
```

## 📜 Available Scripts

### Backend
```bash
npm run dev
```

### Frontend
```bash
npm start
npm run build
npm run preview
```

## 🔮 Future Enhancements

- 🤖 AI-based scoring and auto-feedback
- 📄 Export reports and summaries as PDF
- 🔔 Session reminders and progress gamification
- 👮 Role-based access (Admin, Trainer, MSL)
- 🎙️ Voice-based persona simulation

## 👥 Contributors

- **DNATE Engineering Team**
- Ashmiya VijayaChandran
- Thejus Thomson
- Guhan Santhanam SP

## 📄 License

This project is proprietary and confidential.  
All rights reserved © DNATE 2025.  
Unauthorized distribution or reproduction is strictly prohibited.
