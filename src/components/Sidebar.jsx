import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);

  // Login qilinmagan bo'lsa, har qanday harakat login sahifasiga o'tkazadi
  const goProtected = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center py-3 sidebar-nav"
      style={{ width: "64px", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 30 }}
    >
      <Link to="/" className="text-danger mb-4 fs-3 sidebar-icon-btn">
        <i className="bi bi-pinterest"></i>
      </Link>

      <Link to="/" className="text-dark mb-4 fs-5 sidebar-icon-btn" title={t("sidebar_home")}>
        <i className="bi bi-house-fill"></i>
      </Link>

      <button
        className="btn border-0 text-dark mb-4 fs-5 sidebar-icon-btn"
        title={t("sidebar_boards")}
        onClick={() => goProtected("/boards")}
      >
        <i className="bi bi-grid-fill"></i>
      </button>

      <button
        className="btn border-0 text-dark mb-4 fs-5 sidebar-icon-btn"
        title={t("sidebar_create")}
        onClick={() => goProtected("/pin/create")}
      >
        <i className="bi bi-plus-square"></i>
      </button>

      <button
        className="btn border-0 text-dark mb-4 fs-5 position-relative sidebar-icon-btn"
        title={t("sidebar_chat")}
        onClick={() => goProtected("/chat")}
      >
        <i className="bi bi-chat-dots"></i>
      </button>

      {/* Kecha/kunduz (dark/light) rejimini almashtirish */}
      <button
        className="btn border-0 text-dark mb-4 fs-5 sidebar-icon-btn"
        title={theme === "dark" ? t("day_mode") : t("night_mode")}
        onClick={toggleTheme}
      >
        <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}></i>
      </button>

      <div className="flex-grow-1"></div>

      {/* Sozlamalar (Settings) */}
      <div className="position-relative">
        <button
          className="btn border-0 text-dark fs-5 sidebar-icon-btn"
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
