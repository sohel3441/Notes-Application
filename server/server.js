import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

const PORT = process.env.PORT || 5000;

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" },
// });

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// app.use(cors());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes(io));

io.on("connection", (socket) => {
  socket.on("join-note", (noteId) => {
    socket.join(noteId);
    socket.to(noteId).emit("receive-update")
  });

  socket.on("note-update", ({ noteId, content }) => {
    socket.to(noteId).emit("receive-update", content);
  });
});

server.listen(PORT, () => console.log("Server running"));
