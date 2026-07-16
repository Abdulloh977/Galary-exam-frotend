import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Login qilinmagan bo'lsa, har qanday harakat login sahifasiga o'tkazadi
  const goProtected = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccount(false);
    navigate("/login");
  };

  return (
    <div
      className="d-flex flex-column align-items-center py-3 bg-white border-end"
      style={{ width: "64px", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 30 }}
    >
      <Link to="/" className="text-danger mb-4 fs-3">
        <i className="bi bi-pinterest"></i>
      </Link>

      <Link to="/" className="text-dark mb-4 fs-5" title={t("sidebar_home")}>
        <i className="bi bi-house-fill"></i>
      </Link>

      <button
        className="btn border-0 text-dark mb-4 fs-5"
        title={t("sidebar_boards")}
        onClick={() => goProtected("/boards")}
      >
        <i className="bi bi-grid-fill"></i>
      </button>

      <button
        className="btn border-0 text-dark mb-4 fs-5"
        title={t("sidebar_create")}
        onClick={() => goProtected("/pin/create")}
      >
        <i className="bi bi-plus-square"></i>
      </button>

      <button
        className="btn border-0 text-dark mb-4 fs-5 position-relative"
        title={t("sidebar_chat")}
        onClick={() => goProtected("/chat")}
      >
        <i className="bi bi-chat-dots"></i>
      </button>

      <div className="flex-grow-1"></div>

      {/* Profil avatari — bosilganda akkaunt menyusi ochiladi */}
      <div className="position-relative mb-3">
        {user ? (
          <>
            <button
              className="btn border-0 p-0 overflow-hidden"
              onClick={() => setShowAccount((v) => !v)}
              title={user.firstname}
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            >
              {user.profilePicture ? (
                <img
                  src={`http://localhost:4000/public/${user.profilePicture}`}
                  alt="avatar"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white w-100 h-100"
                  style={{ fontSize: "13px" }}
                >
                  {user.firstname ? user.firstname[0].toUpperCase() : "U"}
                </div>
              )}
            </button>

            {showAccount && (
              <div
                className="position-absolute bg-white rounded-3 shadow p-3"
                style={{ left: "56px", bottom: 0, width: "220px" }}
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
                        src={`http://localhost:4000/public/${user.profilePicture}`}
                        alt="avatar"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      user.firstname ? user.firstname[0].toUpperCase() : "U"
                    )}
                  </div>
                  <div>
                    <p className="mb-0 fw-medium">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="mb-0 text-secondary small">{user.email}</p>
                  </div>
                  <i className="bi bi-check-lg ms-auto"></i>
                </Link>
                <hr className="my-2" />
                <button
                  className="btn btn-light w-100 text-start"
                  onClick={handleLogout}
                >
                  {t("log_out")}
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            className="btn border-0 text-dark fs-5"
            title={t("login_button")}
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-person-circle"></i>
          </button>
        )}
      </div>

      {/* Sozlamalar (Settings) */}
      <div className="position-relative">
        <button
          className="btn border-0 text-dark fs-5"
          title={t("settings")}
          onClick={() => setShowSettings((v) => !v)}
        >
          <i className="bi bi-gear"></i>
        </button>

        {showSettings && (
          <div
            className="position-absolute bg-white rounded-3 shadow p-3"
            style={{ left: "56px", bottom: 0, width: "260px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="fw-medium mb-0">{t("settings_support")}</p>
              <button
                className="btn btn-sm border-0"
                onClick={() => setShowSettings(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              <span className="small">{t("settings")}</span>
              <span className="small">{t("refine_recommendations")}</span>
              <span className="small">{t("link_pinterest")}</span>
              <span className="small">{t("reports_violations")}</span>
              <span className="small">{t("install_windows_app")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;