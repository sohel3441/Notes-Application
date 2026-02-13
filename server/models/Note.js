import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  permission: { type: String, enum: ["editor", "viewer"] },
});

const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    collaborators: [collaboratorSchema],
    shareToken: String,
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
