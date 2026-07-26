import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import CommentItem from "./CommentItem";
import { createCommentApi, deleteCommentApi, updateCommentApi } from "../api/commentApi";

const CommentList = ({ pinId, pinOwnerId, comments, onCommentAdded, onCommentDeleted, onCommentUpdated }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null); // comment._id yoki null
  const [replyText, setReplyText] = useState("");

  const requireLogin = () => {
    if (!user) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const canDelete = (comment) => {
    if (!user) return false;
    const isCommentOwner = comment.user?._id === user._id;
    const isPinOwner = pinOwnerId === user._id;
    const isAdmin = user.role === 102;
    return isCommentOwner || isPinOwner || isAdmin;
  };

  // Tahrirlash faqat izohning o'z egasiga tegishli — pin egasi boshqalarning izohini tahrirlay olmaydi
  const canEdit = (comment) => {
    if (!user) return false;
    return comment.user?._id === user._id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requireLogin()) return;
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

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (requireLogin()) return;
    if (replyText.trim() === "") return;

    try {
      const res = await createCommentApi({
        pinId,
        text: replyText.trim(),
        parentComment: parentId,
      });
      onCommentAdded(res.data.comment);
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Javob yozishda xatolik:", error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      onCommentDeleted(commentId);
    } catch (error) {
      console.error("Izohni o'chirishda xatolik:", error);
    }
  };

  const handleEdit = async (commentId, newText) => {
    try {
      const res = await updateCommentApi(commentId, newText);
      onCommentUpdated(res.data.comment);
    } catch (error) {
      console.error("Izohni tahrirlashda xatolik:", error);
    }
  };

  // Faqat asosiy (parentComment=null) izohlar va ularga tegishli javoblar
  const topLevelComments = comments.filter((c) => !c.parentComment);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentComment === parentId);

  return (
    <div className="mt-3">
      <h6 className="mb-3">
        {t("comments")} ({comments.length})
      </h6>

      {topLevelComments.length === 0 ? (
        <p className="text-secondary small">{t("no_comments")}</p>
      ) : (
        topLevelComments.map((c) => (
          <div key={c._id}>
            <CommentItem
              comment={c}
              canDelete={canDelete(c)}
              canEdit={canEdit(c)}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReplyClick={(id) => setReplyingTo(id === replyingTo ? null : id)}
            />

            {replyingTo === c._id && (
              <form
                onSubmit={(e) => handleReplySubmit(e, c._id)}
                className="d-flex gap-2 ms-4 mb-3"
              >
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={t("write_reply")}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-dark btn-sm" type="submit">
                  <i className="bi bi-send"></i>
                </button>
              </form>
            )}

            {getReplies(c._id).map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                canDelete={canDelete(reply)}
                canEdit={canEdit(reply)}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isReply
              />
            ))}
          </div>
        ))
      )}

      <form onSubmit={handleSubmit} className="d-flex gap-2 mt-3">
        <input
          type="text"
          className="form-control"
          placeholder={t("write_comment")}
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
