import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const formatLastSeen = (dateStr, t) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const dateLabel = isToday ? "" : `${d.toLocaleDateString()} `;
  return `${t("last_seen_at")} ${dateLabel}${time}`;
};

// Chat sarlavhasidagi avatar/ism ustiga bosilganda ochiladigan
// Telegram uslubidagi profil oynasi
const UserProfileModal = ({
  person,
  isOnline,
  isContact,
  isBlocked,
  nickname,
  photosCount,
  onClose,
  onOpenChat,
  onVoiceCall,
  onVideoCall,
  onToggleContact,
  onToggleBlock,
  onSaveNickname,
}) => {
  const { t } = useLanguage();
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(nickname || "");

  useEffect(() => {
    setNicknameInput(nickname || "");
    setEditingNickname(false);
  }, [person?._id, nickname]);

  if (!person) return null;

  const realName = `${person.firstname || ""} ${person.lastname || ""}`.trim();
  const displayName = nickname || realName;

  const handleSaveNickname = (e) => {
    e.preventDefault();
    onSaveNickname(nicknameInput.trim());
    setEditingNickname(false);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1500 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg"
        style={{ width: "340px", maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-4 text-center position-relative"
          style={{
            background: "linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)",
          }}
        >
          <button
            className="btn btn-sm position-absolute border-0"
            style={{ top: "12px", right: "12px" }}
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white overflow-hidden mx-auto mb-3 shadow-sm"
            style={{
              width: "96px",
              height: "96px",
              fontSize: "36px",
              background: "linear-gradient(135deg, #e60023, #ff6b6b)",
            }}
          >
            {person.profilePicture ? (
              <img
                src={`${IMAGE_BASE_URL}/${person.profilePicture}`}
                alt="avatar"
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            ) : (
              displayName ? displayName[0].toUpperCase() : "U"
            )}
          </div>

          <h5 className="mb-0">{displayName}</h5>
          {nickname && <p className="text-secondary small mb-1">{realName}</p>}
          <p className="text-secondary small mb-3">
            {isOnline ? t("online") : formatLastSeen(person.lastSeen, t)}
          </p>

          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-light rounded-3 d-flex flex-column align-items-center px-3 py-2"
              style={{ fontSize: "12px" }}
              onClick={onOpenChat}
            >
              <i className="bi bi-chat-dots mb-1"></i>
              {t("open_chat")}
            </button>
            <button
              className="btn btn-light rounded-3 d-flex flex-column align-items-center px-3 py-2"
              style={{ fontSize: "12px" }}
              onClick={onVoiceCall}
              disabled={isBlocked}
            >
              <i className="bi bi-telephone mb-1"></i>
              {t("voice_call")}
            </button>
            <button
              className="btn btn-light rounded-3 d-flex flex-column align-items-center px-3 py-2"
              style={{ fontSize: "12px" }}
              onClick={onVideoCall}
              disabled={isBlocked}
            >
              <i className="bi bi-camera-video mb-1"></i>
              {t("video_call")}
            </button>
          </div>
        </div>

        <div className="border-top px-4 py-3">
          <p className="text-danger mb-0">@{person.username}</p>
          <p className="text-secondary small mb-0">{t("username_label")}</p>
        </div>

        {photosCount > 0 && (
          <div className="border-top px-4 py-3 d-flex align-items-center gap-2">
            <i className="bi bi-image text-secondary"></i>
            <span className="small">
              {photosCount} {t("shared_photos")}
            </span>
          </div>
        )}

        {isContact && (
          <div className="border-top px-4 py-3">
            {editingNickname ? (
              <form onSubmit={handleSaveNickname} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={t("nickname_placeholder")}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-danger btn-sm" type="submit">
                  {t("save")}
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => setEditingNickname(false)}
                >
                  {t("cancel")}
                </button>
              </form>
            ) : (
              <button
                className="btn btn-light w-100 text-start d-flex align-items-center gap-2"
                onClick={() => setEditingNickname(true)}
              >
                <i className="bi bi-pencil"></i>
                {t("edit_nickname")}
              </button>
            )}
          </div>
        )}

        <div className="border-top py-2">
          <button
            className="btn w-100 text-start px-4 py-2 border-0 d-flex align-items-center gap-2"
            onClick={onToggleContact}
          >
            <i className={`bi ${isContact ? "bi-bookmark-x" : "bi-bookmark-plus"}`}></i>
            {isContact ? t("remove_contact") : t("save_contact")}
          </button>
          <button
            className="btn w-100 text-start px-4 py-2 border-0 d-flex align-items-center gap-2 text-danger"
            onClick={onToggleBlock}
          >
            <i className={`bi ${isBlocked ? "bi-hand-thumbs-up" : "bi-slash-circle"}`}></i>
            {isBlocked ? t("unblock") : t("block")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
