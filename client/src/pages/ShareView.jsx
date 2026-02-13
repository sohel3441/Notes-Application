import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function ShareView() {
  const { token } = useParams();
  const [note, setNote] = useState(null);

  const fetchNote = async () => {
    const res = await axios.get(`${API_URL}/notes/public/${token}`);
    setNote(res.data);
  };

  useEffect(() => {
    fetchNote();
  }, []);

  if (!note) return <p>Loading...</p>;

  return (
    <div>
      <h2>{note.title}</h2>
      <p>{note.content}</p>
    </div>
  );
}
