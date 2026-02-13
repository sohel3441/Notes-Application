import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import "../styles/layout.css";
import { useRef } from "react";


const API_URL = import.meta.env.VITE_API_URL;

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const saveTimeout = useRef(null);

  const [note, setNote] = useState({ title: "", content: "" });
  const [lastSaved, setLastSaved] = useState("");

  const [collabEmail, setCollabEmail] = useState("");
const [collabRole, setCollabRole] = useState("viewer");
const [collaborators, setCollaborators] = useState([]);

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  const isViewer = user?.role === "viewer";

const fetchNote = async () => {
  const res = await axios.get(`${API_URL}/notes`, getAuthConfig());

  const found = res.data.find((n) => n._id === id);

  if (found) {
    setNote(found);
    setCollaborators(found.collaborators || []);
    setLastSaved(new Date(found.updatedAt).toLocaleString());
  }
};

const addCollaborator = async () => {
  if (!collabEmail.trim()) return;

  await axios.post(
    `${API_URL}/notes/${id}/collaborator`,
    { email: collabEmail, role: collabRole },
    getAuthConfig()
  );
    // router.post("/:id/collaborator", authMiddleware, addCollaborator);
  

  setCollabEmail("");
  fetchNote();
};


  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
  return () => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
  };
}, []);


  useEffect(() => {
    socket.emit("join-note", id);

    socket.on("receive-update", (content) => {
      setNote((prev) => ({ ...prev, content }));
    });

    return () => {
      socket.off("receive-update");
    };
  }, [id]);


const updateContent = (e) => {
  const content = e.target.value;

  setNote((prev) => ({ ...prev, content }));

  // realtime typing via socket
  socket.emit("note-update", { noteId: id, content });

  if (isViewer) return;

  // debounce DB save
  if (saveTimeout.current) {
    clearTimeout(saveTimeout.current);
  }

  saveTimeout.current = setTimeout(async () => {
    await axios.put(
      `${API_URL}/notes/${id}`,
      { content },
      getAuthConfig()
    );

    setLastSaved(new Date().toLocaleString());
  }, 800); // save after user stops typing
};

//   const updateContent = async (e) => {
//     const content = e.target.value;

//     setNote((prev) => ({ ...prev, content }));

//     socket.emit("note-update", { noteId: id, content });

//     if (!isViewer) {
//       await axios.put(
//         `${API_URL}/notes/${id}`,
//         { content },
//         getAuthConfig()
//       );

//       setLastSaved(new Date().toLocaleString());
//     }
//   };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!note) return <p>Loading...</p>;

  return (
    <div className="page-container">
      {/* Navbar */}
      <div className="navbar">
        <h3>Realtime Notes</h3>

        <div className="nav-buttons">
          <button onClick={() => navigate("/")}>Dashboard</button>
          <button onClick={() => navigate("/activity")}>Activity</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Editor Card */}
      <div className="editor-card">
        <div className="editor-title">
          {note.title}
          {isViewer && <span className="badge">Read Only</span>}
        </div>

        {/* Collaborators Panel */}
{!isViewer && (
  <div style={{ marginBottom: "15px" }}>
    <h4>Collaborators</h4>

    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <input
        placeholder="User email"
        value={collabEmail}
        onChange={(e) => setCollabEmail(e.target.value)}
      />

      <select
        value={collabRole}
        onChange={(e) => setCollabRole(e.target.value)}
      >
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
      </select>

      <button onClick={addCollaborator}>Add</button>
    </div>

    {collaborators.map((c) => (
      <div key={c._id} className="editor-meta">
        {/* {c.user?.email || "User"} - {c.role} */}
        {c.user?.email || "User"} - {c.permission}
        
      </div>
    ))}
  </div>
)}


        <div className="editor-meta">
          Last updated: {lastSaved || "Not saved yet"}
        </div>

        <textarea
          className="textarea"
          value={note.content}
          onChange={updateContent}
          disabled={isViewer}
        />

        <div className="status">
          {isViewer
            ? "Viewing mode"
            : "Auto-saving changes in real time"}
        </div>
      </div>
      
    </div>
  );
}
