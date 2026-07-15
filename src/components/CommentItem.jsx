const CommentItem = ({ comment }) => {
  const authorName = comment.user
    ? `${comment.user.firstname || ""} ${comment.user.lastname || ""}`.trim() ||
      comment.user.username
    : "Foydalanuvchi";

  return (
    <div className="d-flex gap-2 mb-3">
      <div
        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white flex-shrink-0"
        style={{ width: "32px", height: "32px", fontSize: "13px" }}
      >
        {authorName[0]?.toUpperCase() || "U"}
      </div>
      <div>
        <p className="mb-0 small fw-medium">{authorName}</p>
        <p className="mb-0 small text-secondary">{comment.text}</p>
      </div>
    </div>
  );
};

export default CommentItem;
