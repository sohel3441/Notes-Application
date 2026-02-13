import Note from "../models/Note.js";
import Activity from "../models/Activity.js";
import crypto from "crypto";
import User from "../models/User.js";

export const createNote = async (req, res) => {
  if (req.user.role === "viewer")
    return res.status(403).json({ msg: "Viewers cannot create notes" });

  const note = await Note.create({
    ...req.body,
    owner: req.user.id,
  });

  await Activity.create({
    user: req.user.id,
    action: "create",
    note: note._id,
  });

  res.json(note);
};

export const getNotes = async (req, res) => {
  const notes = await Note.find({
    $or: [
      { owner: req.user.id },
      { "collaborators.user": req.user.id },
    ],
  })
    .populate("collaborators.user", "email");

  res.json(notes);
};


export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ msg: "Note not found" });

    const isOwner = note.owner.toString() === req.user.id;

    const collaborator = note.collaborators.find(
      (c) =>
        (c.user._id?.toString?.() || c.user.toString()) === req.user.id
    );

    const canEdit =
      isOwner || collaborator?.permission === "editor";

    if (!canEdit) {
      return res.status(403).json({ msg: "No edit permission" });
    }

    note.content = req.body.content ?? note.content;
    note.title = req.body.title ?? note.title;

    await note.save();

    await Activity.create({
      user: req.user.id,
      action: "update",
      note: note._id,
    });

    req.io.to(req.params.id).emit("receive-update", note.content);

    res.json(note);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ msg: "Note not found" });

  if (note.owner.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Only owner can delete note" });
  }

  await note.deleteOne();

  await Activity.create({
    user: req.user.id,
    action: "delete",
    note: note._id,
  });

  res.json({ msg: "Note deleted" });
};

export const searchNotes = async (req, res) => {
  const q = req.query.q;

  const notes = await Note.find({
    $and: [
      {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
        ],
      },
      {
        $or: [
          { owner: req.user.id },
          { "collaborators.user": req.user.id },
        ],
      },
    ],
  });

  res.json(notes);
};

export const shareNote = async (req, res) => {
  const token = crypto.randomBytes(16).toString("hex");

  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { shareToken: token },
    { new: true }
  );

  res.json({ link: `/share/${token}` });
};

export const getPublicNote = async (req, res) => {
  const note = await Note.findOne({ shareToken: req.params.token });

  if (!note) return res.status(404).json({ msg: "Note not found" });

  res.json({
    title: note.title,
    content: note.content,
  });
};

export const getActivityLogs = async (req, res) => {
  const logs = await Activity.find({ user: req.user.id })
    .populate("note", "title")
    .sort({ timestamp: -1 });

  res.json(logs);
};

export const addCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ msg: "Email and role required" });
    }

    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ msg: "Note not found" });

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Only owner can add collaborators" });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!note.collaborators) {
      note.collaborators = [];
    }

    const alreadyExists = note.collaborators.find(
      (c) =>
        (c.user._id?.toString?.() || c.user.toString()) ===
        userToAdd._id.toString()
    );

    if (alreadyExists) {
      return res.status(400).json({ msg: "Already a collaborator" });
    }

    note.collaborators.push({
      user: userToAdd._id,
      permission: role, // 🔥 FIXED
    });

    await note.save();

    await Activity.create({
      user: req.user.id,
      action: "share",
      note: note._id,
    });

    res.json({ msg: "Collaborator added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};
