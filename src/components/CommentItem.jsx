import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const CommentItem = ({ comment, canDelete, onDelete, onReplyClick, isReply }) => {
  const { t } = useLanguage();

  const authorName = comment.user
    ? `${comment.user.firstname || ""} ${comment.user.lastname || ""}`.trim() ||
      comment.user.username
    : "User";

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
        <p className="mb-1 small text-secondary">{comment.text}</p>
        <div className="d-flex gap-3">
          {!isReply && (
            <button
              className="btn btn-link btn-sm p-0 text-secondary small text-decoration-none"
              onClick={() => onReplyClick(comment._id)}
            >
              {t("reply")}
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
      </div>
    </div>
  );
};

export default CommentItem;
