# TrekConnect – MERN Stack Project

Find your perfect trek companion. Full-stack app with React (Vite), Express, MongoDB, JWT auth, and TailwindCSS.

## Features

- **Landing page**: Hero with trek background, CTA (Sign Up / Login), Navbar (Home, About, Trips, Contact), Footer with social icons
- **Sign Up**: Full name, email, password, confirm password, fitness level, profile photo; client-side validation; redirect to dashboard on success
- **Login**: Email/password; JWT stored in `localStorage`; redirect to dashboard
- **Dashboard**: Protected route; shows user profile (name, email, fitness level, photo)
- **Backend**: REST API (`POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`), bcrypt, JWT, MongoDB (Mongoose), multer for profile photo upload

## Prerequisites

- Node.js 18+
- MongoDB (connection string in `backend/.env`)

## Setup

### Backend

```bash
cd backend
npm install
```

Ensure `backend/.env` has:

- `PORT=5000`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_secret`

Start:

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. API and `/uploads` are proxied to the backend.

## Scripts

| Location   | Command      | Description        |
|-----------|--------------|--------------------|
| backend   | `npm run dev`| Start API (watch)  |
| backend   | `npm start`  | Start API          |
| frontend  | `npm run dev`| Start Vite dev     |
| frontend  | `npm run build` | Production build |

## API

| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | `/api/auth/signup`   | Register (multipart)|
| POST   | `/api/auth/login`    | Login              |
| GET    | `/api/auth/me`       | Current user (Bearer token) |

## Tech Stack

- **Frontend**: React 18, Vite, React Router, TailwindCSS, Axios
- **Backend**: Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, multer, cors, dotenv
- **Database**: MongoDB (Users collection, unique email)
