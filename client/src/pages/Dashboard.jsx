import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/layout.css";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user =
      storedUser && storedUser !== "undefined"
        ? JSON.parse(storedUser)
        : null;
  } catch {
    user = null;
  }

  const fetchNotes = async () => {
    const res = await axios.get(`${API_URL}/notes`, getAuthConfig());
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async () => {
    if (!title.trim()) return;

    const res = await axios.post(
      `${API_URL}/notes`,
      { title, content: "" },
      getAuthConfig()
    );

    setTitle("");
    navigate(`/note/${res.data._id}`);
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API_URL}/notes/${id}`, getAuthConfig());
    fetchNotes();
  };

  const shareNote = async (id) => {
    const res = await axios.post(
      `${API_URL}/notes/share/${id}`,
      {},
      getAuthConfig()
    );

    const link = `${window.location.origin}/share/${res.data.link
      .split("/")
      .pop()}`;

    alert(`Public link:\n${link}`);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) return fetchNotes();

    const res = await axios.get(
      `${API_URL}/notes/search?q=${value}`,
      getAuthConfig()
    );

    setNotes(res.data);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <div className="navbar">
        <h3>Realtime Notes</h3>

        <div className="nav-buttons">
          <button onClick={() => navigate("/activity")}>Activity</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Create Note Card */}
      {user?.role && user.role !== "viewer" && (
        <div className="editor-card" style={{ marginBottom: "20px" }}>
          <div className="editor-title">Create New Note</div>

          <input
            className="textarea"
            style={{ height: "45px", marginBottom: "10px" }}
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button className="nav-buttons button" onClick={createNote}>
            Create Note
          </button>
        </div>
      )}

      {/* Search */}
      <div className="editor-card" style={{ marginBottom: "20px" }}>
        <input
          className="textarea"
          style={{ height: "45px" }}
          placeholder="Search notes..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Notes Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {notes.length === 0 ? (
          <div className="editor-card">No notes found</div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="editor-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/note/${note._id}`)}
            >
              <div className="editor-title">{note.title}</div>

              <div className="editor-meta">
                Updated:{" "}
                {new Date(note.updatedAt).toLocaleString()}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button
                  className="nav-buttons button"
                  onClick={(e) => {
                    e.stopPropagation();
                    shareNote(note._id);
                  }}
                >
                  Share
                </button>

                {user?.role && user.role !== "viewer" && (
                  <button
                    className="nav-buttons button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note._id);
                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
