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

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    const res = await axios.get(`${API_URL}/notes/activity`, getAuthConfig());
    setLogs(res.data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
          <button onClick={() => navigate("/")}>Dashboard</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Activity Card */}
      <div className="editor-card">
        <div className="editor-title">Activity Logs</div>

        {logs.length === 0 ? (
          <p className="editor-meta">No activity yet</p>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              style={{
                borderBottom: "1px solid #374151",
                padding: "10px 0",
              }}
            >
              <div>
                <strong>{log.note?.title || "Untitled Note"}</strong>
                <span className="badge">{log.action}</span>
              </div>

              <div className="editor-meta">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
