# SkillSwap

**A full-stack web application where people exchange skills — without money. The currency is knowledge.**

## Tech Stack

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Real-time:** Socket.io
- **Auth:** JWT + bcrypt

## Features

- User authentication (register/login with JWT)
- Skill profiles (offer skills & list what you want to learn)
- Search & discovery (find skill partners by skill name)
- Swap requests (send/accept/reject skill exchange offers)
- Real-time chat (Socket.io powered messaging)
- Session booking (schedule video or in-person sessions)
- Ratings & reviews (1-5 stars + written feedback)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

### 2. Setup Frontend

```bash
cd client
npm install
npm start
```

The app will open at `http://localhost:3000`.

## Hosting (Vercel + Render)

Recommended production setup:

- Frontend: Vercel (from `client/`)
- Backend API + Socket.io: Render (from repo root using `render.yaml`)

### 1. Push to GitHub

The project is already in: `https://github.com/Radhil-33/skillswap`

### 2. Deploy Backend on Render

1. In Render, click **New +** -> **Web Service**.
2. Connect repo: `Radhil-33/skillswap`.
3. Render auto-detects `render.yaml` from the repo.
4. Set required environment variables:
	- `MONGODB_URI` = your MongoDB Atlas connection string
	- `JWT_SECRET` = long random secret
	- `CLIENT_URL` = your Vercel frontend URL (for example `https://skillswap.vercel.app`)
5. Deploy.

### 3. Deploy Frontend on Vercel

1. In Vercel, click **Add New...** -> **Project**.
2. Import repo: `Radhil-33/skillswap`.
3. Set **Root Directory** to `client`.
4. Framework preset: **Create React App** (auto).
5. Add environment variables:
   - `REACT_APP_API_URL` = `https://<your-render-service>.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://<your-render-service>.onrender.com`
   - `REACT_APP_API_ORIGIN` = `https://<your-render-service>.onrender.com`
6. Deploy.

### 4. Notes

- Render service in this setup is backend-only.
- API endpoints stay under `/api`.
- Socket.io connects to your Render URL using `REACT_APP_SOCKET_URL`.
- Avatar uploads are served from `/uploads` on Render.

## Project Structure

```
skillswap/
├── server/                # Backend API
│   ├── config/            # Database config
│   ├── middleware/         # JWT auth middleware
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── SwapRequest.js
│   │   ├── Chat.js
│   │   ├── Session.js
│   │   └── Review.js
│   ├── routes/            # API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── swaps.js
│   │   ├── chat.js
│   │   ├── sessions.js
│   │   └── reviews.js
│   └── index.js           # Server entry + Socket.io
├── client/                # React frontend
│   └── src/
│       ├── context/       # Auth & Socket contexts
│       ├── components/    # Navbar
│       ├── pages/         # All app pages
│       └── api.js         # Axios API client
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users/profile/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/search` | Search users by skill |
| POST | `/api/swaps` | Send swap request |
| GET | `/api/swaps` | Get swap requests |
| PUT | `/api/swaps/:id/accept` | Accept swap |
| PUT | `/api/swaps/:id/reject` | Reject swap |
| GET | `/api/chat/conversations` | Get conversations |
| GET | `/api/chat/:id/messages` | Get messages |
| POST | `/api/sessions` | Book session |
| GET | `/api/sessions` | Get sessions |
| PUT | `/api/sessions/:id/complete` | Complete session |
| PUT | `/api/sessions/:id/cancel` | Cancel session |
| POST | `/api/reviews` | Leave review |
| GET | `/api/reviews/user/:id` | Get user reviews |
