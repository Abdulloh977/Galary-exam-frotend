import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { deleteUserApi } from "../api/userApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";

// Qidiruv panelidan keyin (yuqori panelda) ko'rinadigan profil avatari + akkaunt menyusi
const AccountMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showAccount, setShowAccount] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    setShowAccount(false);
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("confirm_delete_account"));
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteUserApi(user._id);
      logout();
      setShowAccount(false);
      navigate("/");
    } catch (error) {
      console.error("Akkauntni o'chirishda xatolik:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <button
        className="btn btn-danger rounded-pill btn-sm flex-shrink-0"
        onClick={() => navigate("/login")}
      >
        {t("login_button")}
      </button>
    );
  }

  return (
    <div className="position-relative flex-shrink-0">
      <button
        className="btn border-0 p-0 d-flex align-items-center gap-1"
        onClick={() => setShowAccount((v) => !v)}
      >
        <div
          className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0"
          style={{ width: "32px", height: "32px", fontSize: "13px" }}
        >
          {user.profilePicture ? (
            <img
              src={`${IMAGE_BASE_URL}/${user.profilePicture}`}
              alt="avatar"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            user.firstname ? user.firstname[0].toUpperCase() : "U"
          )}
        </div>
        <i className="bi bi-chevron-down text-secondary small"></i>
      </button>

      {showAccount && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 40 }}
            onClick={() => setShowAccount(false)}
          ></div>

          <div
            className="position-absolute bg-white rounded-3 shadow p-3"
            style={{ right: 0, top: "44px", minWidth: "220px", maxWidth: "320px", width: "max-content", zIndex: 41 }}
          >
            <p className="text-secondary small mb-2">{t("currently_in")}</p>
            <Link
              to={`/profile/${user._id}`}
              className="d-flex align-items-center gap-2 mb-3 text-decoration-none text-dark"
              onClick={() => setShowAccount(false)}
            >
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0"
                style={{ width: "36px", height: "36px" }}
              >
                {user.profilePicture ? (
                  <img
                    src={`${IMAGE_BASE_URL}/${user.profilePicture}`}
                    alt="avatar"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  user.firstname ? user.firstname[0].toUpperCase() : "U"
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="mb-0 fw-medium text-truncate">
                  {user.firstname} {user.lastname}
                </p>
                <p className="mb-0 text-secondary small" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                  {user.email}
                </p>
              </div>
              <i className="bi bi-check-lg ms-auto"></i>
            </Link>
            <hr className="my-2" />
            <button className="btn btn-light w-100 text-start" onClick={handleLogout}>
              {t("log_out")}
            </button>
            <button
              className="btn btn-light w-100 text-start text-danger mt-1"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              <i className="bi bi-trash3 me-1"></i>
              {deleting ? t("deleting_account") : t("delete_account")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountMenu;
