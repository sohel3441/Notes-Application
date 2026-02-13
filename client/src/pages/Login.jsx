import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      const res = await axios.post(`${API_URL}/auth/register`, form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } else {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              className="auth-input"
              placeholder="Full Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          )}

          <input
            className="auth-input"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {isRegister && (
            <select
              className="auth-input"
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button className="auth-button" type="submit">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div
          className="auth-toggle"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? (
            <>
              Already have an account? <span>Login</span>
            </>
          ) : (
            <>
              New user? <span>Create account</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
