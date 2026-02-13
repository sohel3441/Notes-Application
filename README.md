# Real-Time Collaborative Notes Application

# 🧱 Tech Stack

## Frontend
- React.js (Vite)
- Axios
- Socket.io-client
- React Router

## Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Socket.io

---

# 🔐 Features

## Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access: Admin, Editor, Viewer
- API-level access control

## Notes Management
- Create, edit, delete notes
- Ownership tracking
- Last-modified timestamps
- Collaborator management with permissions (editor/viewer)

## Real-Time Collaboration
- Live multi-user editing using WebSockets (Socket.io)
- Auto-save with debounce
- Update awareness across clients

## Activity Log
- Tracks create, update, delete, and share actions
- Stores timestamp, user, and note reference

## Search
- Search notes by title and content
- Results filtered by access permissions

## Public Read-Only Sharing
- Shareable public link
- No authentication required
- Editing restricted

---

# 🗂️ Project Structure

realtime-notes/
├── client # React frontend
├── server # Express backend
└── README.md

ealtime-notes/
├── client # React frontend
├── server # Express backend
└── README.md


---

# ⚙️ Environment Variables

## Backend (`server/.env`)
```

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

```

## Frontend (`client/.env`)
```

VITE_API_URL=http://localhost:5000/api

```

---

# 🛠️ Local Setup

## 1️⃣ Clone Repository
```bash
git clone https://github.com/sohel3441/Notes-Application.git
cd realtime-collaborative-notes