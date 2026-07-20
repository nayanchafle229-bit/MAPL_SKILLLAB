# 🎓 Smart Learning & Quiz Platform
Full-stack web app — React + Node.js + MongoDB Atlas + JWT Auth

---

## 📁 Project Structure
```
smart-quiz/
├── backend/       ← Node.js + Express API (port 3001)
└── frontend/      ← React + Vite + Tailwind (port 3000)
```

---

## ⚡ Setup in 5 Steps

### Step 1 — Backend Setup
```bash
cd backend
npm install
```

Edit `.env` — update your MongoDB URI:
```env
MONGODB_URI=mongodb+srv://MAPL_db_user:8603271546@cluster0.arcqild.mongodb.net/smartquiz?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=smartquiz
JWT_SECRET=smartquiz_super_secret_jwt_key_2024_xyz
ADMIN_USERNAME=a
ADMIN_PASSWORD=a
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Step 2 — Whitelist Your IP in MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Your Project → Security → Network Access
3. Click **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 3 — Seed Sample Data (optional)
```bash
cd backend
npm run seed
```
This adds:
- 50 sample quiz questions (JS, React, Node, MongoDB, Web)
- 5 sample courses with YouTube links

### Step 4 — Start Backend
```bash
cd backend
npm run dev
```
Server starts at → **http://localhost:3001**
You should see:
```
✅ MongoDB Connected: cluster0.arcqild.mongodb.net
🚀 Smart Quiz API → http://localhost:3001
👤 Admin login: username=a  password=a
```

### Step 5 — Start Frontend
```bash
cd frontend
npm install
npm run dev
```
App opens at → **http://localhost:3000**

---

## 👤 Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | `a`      | `a`      |
| User  | Register a new account via /register |

---

## 🗺️ Pages

### User Flow
| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Create account |
| `/profile` | Setup profile (required after register) |
| `/dashboard` | Stats, recent results, quick links |
| `/courses` | Browse all courses |
| `/courses/:id` | Watch course video |
| `/quiz` | Take randomized 40-question quiz |
| `/result/:id` | Detailed result with answer review |
| `/history` | All past quiz attempts |

### Admin Flow
| Route | Description |
|-------|-------------|
| `/admin` | Stats dashboard |
| `/admin/courses` | Add/Edit/Delete courses |
| `/admin/questions` | Add/Edit/Delete questions + Bulk Import |
| `/admin/users` | View all registered users |
| `/admin/results` | View all quiz submissions |

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login (returns JWT) |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/user/profile` | JWT | Get profile |
| PUT | `/api/user/profile` | JWT | Update profile |
| GET | `/api/course` | JWT | Get all courses |
| POST | `/api/course` | Admin | Create course |
| PUT | `/api/course/:id` | Admin | Update course |
| DELETE | `/api/course/:id` | Admin | Delete course |
| GET | `/api/question/random?limit=40` | JWT | Get 40 random questions (no answers) |
| GET | `/api/question` | JWT | Admin: all questions |
| POST | `/api/question` | Admin | Add question(s) |
| PUT | `/api/question/:id` | Admin | Update question |
| DELETE | `/api/question/:id` | Admin | Delete question |
| POST | `/api/quiz/submit` | JWT | Submit quiz answers |
| GET | `/api/quiz/my-results` | JWT | My results |
| GET | `/api/quiz/result/:id` | JWT | Single result with answers |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/results` | Admin | All quiz results |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |

---

## 🧠 Quiz System Logic

1. Admin adds questions to the question bank (unlimited)
2. On quiz start → backend fetches all active questions
3. MongoDB `$sample` aggregation randomly selects **40 unique questions**
4. Correct answers are **never sent to the frontend**
5. On submit → backend fetches correct answers and evaluates
6. Results stored with per-question correctness data
7. Full review available on the Result page

---

## 🗄️ MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `users` | Auth + profile data |
| `courses` | Course title, description, video URL |
| `questions` | Question bank with correct answers |
| `quizresults` | Submitted quiz results with per-answer data      |

---

## 🔐 Security Features
- Passwords hashed with **bcryptjs** (10 rounds)
- **JWT** authentication on all protected routes
- Admin routes double-protected with role check middleware
- Correct answers never exposed in API responses to users
- Input validation on all endpoints

---

## 📦 Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, React Router v6, Axios
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB Atlas
- **Auth**: JWT stored in localStorage, sent via Authorization header
