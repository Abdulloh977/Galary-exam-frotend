import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const CommentItem = ({ comment, canDelete, canEdit, onDelete, onEdit, onReplyClick, isReply }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const authorName = comment.user
    ? `${comment.user.firstname || ""} ${comment.user.lastname || ""}`.trim() ||
      comment.user.username
    : "User";

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editText.trim() === "") return;
    onEdit(comment._id, editText.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  return (
    <div className={`d-flex gap-2 mb-3 ${isReply ? "ms-4" : ""}`}>
      <Link to={`/profile/${comment.user?._id}`} className="flex-shrink-0">
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden"
          style={{ width: "32px", height: "32px", fontSize: "13px" }}
        >
          {comment.user?.profilePicture ? (
            <img
              src={`${IMAGE_BASE_URL}/${comment.user.profilePicture}`}
              alt="avatar"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            authorName[0]?.toUpperCase() || "U"
          )}
        </div>
      </Link>
      <div className="flex-grow-1">
        <Link
          to={`/profile/${comment.user?._id}`}
          className="text-decoration-none text-dark small fw-medium"
        >
          {authorName}
        </Link>

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="d-flex gap-2 mb-1">
            <input
              type="text"
              className="form-control form-control-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={t("edit_comment_placeholder")}
              autoFocus
            />
            <button className="btn btn-dark btn-sm" type="submit">
              {t("save")}
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={handleCancelEdit}
            >
              {t("cancel")}
            </button>
          </form>
        ) : (
          <p className="mb-1 small text-secondary">{comment.text}</p>
        )}

        {!isEditing && (
          <div className="d-flex gap-3">
            {!isReply && (
              <button
                className="btn btn-link btn-sm p-0 text-secondary small text-decoration-none"
                onClick={() => onReplyClick(comment._id)}
              >
                {t("reply")}
              </button>
            )}
            {canEdit && (
              <button
                className="btn btn-link btn-sm p-0 text-secondary small text-decoration-none"
                onClick={() => setIsEditing(true)}
              >
                {t("edit")}
              </button>
            )}
            {canDelete && (
              <button
                className="btn btn-link btn-sm p-0 text-danger small text-decoration-none"
                onClick={() => onDelete(comment._id)}
              >
                {t("delete")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
