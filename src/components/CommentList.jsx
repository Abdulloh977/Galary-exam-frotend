import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CommentItem from "./CommentItem";
import { createCommentApi } from "../api/commentApi";

const CommentList = ({ pinId, comments, onCommentAdded }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Login qilmagan bo'lsa — login sahifasiga
    if (!user) {
      navigate("/login");
      return;
    }

    if (text.trim() === "") return;

    try {
      setSending(true);
      const res = await createCommentApi({ pinId, text: text.trim() });
      onCommentAdded(res.data.comment);
      setText("");
    } catch (error) {
      console.error("Izoh yozishda xatolik:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3">
      <h6 className="mb-3">Izohlar ({comments.length})</h6>

      {comments.length === 0 ? (
        <p className="text-secondary small">Hozircha izoh yo'q</p>
      ) : (
        comments.map((c) => <CommentItem key={c._id} comment={c} />)
      )}

      <form onSubmit={handleSubmit} className="d-flex gap-2 mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Izoh qoldiring..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-dark" type="submit" disabled={sending}>
          <i className="bi bi-send"></i>
        </button>
      </form>
    </div>
  );
};

export default CommentList;
