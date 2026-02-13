import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  searchNotes,
  shareNote,
  getPublicNote,
  getActivityLogs,
  addCollaborator
} from "../controllers/noteController.js";

export default (io) => {
  const router = express.Router();

  router.use((req, res, next) => {
    req.io = io;
    next();
  });

  router.post("/", authMiddleware, createNote);
  router.get("/", authMiddleware, getNotes);
  router.put("/:id", authMiddleware, updateNote);
  router.delete("/:id", authMiddleware, deleteNote);
  router.get("/search", authMiddleware, searchNotes);
  router.post("/share/:id", authMiddleware, shareNote);
  router.get("/public/:token", getPublicNote);
  router.get("/activity", authMiddleware, getActivityLogs);
  router.post("/:id/collaborator", authMiddleware, addCollaborator);

  return router;
};