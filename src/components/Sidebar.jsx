import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom"; 
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);

  // Modallar uchun holatlar (state) va mantiqlar
  const [activeModal, setActiveModal] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState(["nature", "tech", "design"]);
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("spam");

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
            className="position-fixed bg-white rounded-4 shadow-lg p-3"
            style={{ 
              left: "74px",       
              bottom: "16px",     
              width: "290px", 
              zIndex: 1050,
              border: "1px solid #EFEFEF",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.12)"
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <span className="fw-bold text-dark small">{t("settings_support")}</span>
              <button
                className="btn btn-sm border-0 p-0 text-secondary"
                onClick={() => setShowSettings(false)}
              >
                <i className="bi bi-x-lg" style={{ fontSize: "13px" }}></i>
              </button>
            </div>
            
            <div className="d-flex flex-column gap-1 text-dark">
              <button
                className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2"
                style={{ fontSize: "13px", fontWeight: "500" }}
                onClick={() => {
                  setShowSettings(false);
                  if (!user) navigate("/login");
                  else navigate("/profile/edit");
                }}
              >
                <i className="bi bi-person-gear fs-6 text-dark"></i>
                {t("settings")}
              </button>

              <button
                className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2"
                style={{ fontSize: "13px", fontWeight: "500" }}
                onClick={() => openModalHandler("tavsiya")}
              >
                <i className="bi bi-sliders fs-6 text-dark"></i>
                {t("refine_recommendations")}
              </button>

              <button
                className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2"
                style={{ fontSize: "13px", fontWeight: "500" }}
                onClick={() => openModalHandler("pinterest")}
              >
                <i className="bi bi-pinterest fs-6 text-danger"></i>
                {t("link_pinterest")}
              </button>

              <button
                className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2"
                style={{ fontSize: "13px", fontWeight: "500" }}
                onClick={() => openModalHandler("shikoyat")}
              >
                <i className="bi bi-exclamation-triangle fs-6 text-warning"></i>
                {t("reports_violations")}
              </button>

              <button
                className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2"
                style={{ fontSize: "13px", fontWeight: "500" }}
                onClick={() => openModalHandler("windows")}
              >
                <i className="bi bi-windows fs-6 text-primary"></i>
                {t("install_windows_app")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= PORTAL MODALLARI ================= */}
      {activeModal && createPortal(
        <>
          {/* 1. Tavsiyalarni sozlash Modali */}
          {activeModal === "tavsiya" && (
            <Modal title={t("refine_recommendations")} onClose={() => setActiveModal(null)}>
              <p className="text-secondary small mb-3">Lentangizda qanday mavzulardagi rasmlar ko'proq chiqishini belgilang:</p>
              <div className="d-flex flex-wrap gap-2 mb-4" style={{ maxHeight: "180px", overflowY: "auto" }}>
                {[
                  { id: "nature", label: "Tabiat va Manzaralar" },
                  { id: "cars", label: "Avtomobillar" },
                  { id: "tech", label: "Texnologiyalar" },
                  { id: "anime", label: "Anime san'ati" },
                  { id: "food", label: "Taom va Retseptlar" },
                  { id: "sport", label: "Sport olami" },
                  { id: "design", label: "Interyer Dizayn" },
                  { id: "fashion", label: "Moda va Kiyim" }
                ].map((topic) => {
                  const isChecked = selectedInterests.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${isChecked ? "btn-dark" : "btn-outline-secondary"}`}
                      onClick={() => handleInterestChange(topic.id)}
                    >
                      <i className={`bi ${isChecked ? "bi-check-circle-fill" : "bi-circle"}`}></i>
                      {topic.label}
                    </button>
                  );
                })}
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-light w-50 rounded-pill" onClick={() => setActiveModal(null)}>Bekor qilish</button>
                <button className="btn btn-danger w-50 rounded-pill" style={{ backgroundColor: "#E60023" }} onClick={handleSaveRecommendations}>Saqlash</button>
              </div>
            </Modal>
          )}

                    {/* 2. Pinterest Modali */}
          {activeModal === "pinterest" && (
            <Modal title={t("link_pinterest")} onClose={() => setActiveModal(null)}>
              <p className="text-secondary small mb-3">Akkauntingizni rasmiy Pinterest tizimi bilan integratsiya qiling.</p>
              <button className="btn btn-danger w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2" style={{ backgroundColor: "#E60023" }} onClick={() => alert("Ulanmoqda...")}>
                <i className="bi bi-pinterest fs-5"></i> Pinterest hisobiga ulanish
              </button>
            </Modal>
          )}
          
          {/* 3. Shikoyatlar Modali */}
          {activeModal === "shikoyat" && (
            <Modal title={t("reports_violations")} onClose={() => setActiveModal(null)}>
              <form onSubmit={handleSendReport}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Muammo turi:</label>
                  <select className="form-select rounded-3" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="spam">Spam yoki firgarlik</option>
                    <option value="abuse">Haqorat yoki zo'ravonlik</option>
                    <option value="other">Boshqa</option>
                  </select>
                </div>
                <div className="mb-3">
                  <textarea className="form-control rounded-3" rows="3" placeholder="Muammoni yozing..." value={reportText} onChange={(e) => setReportText(e.target.value)}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 rounded-pill py-2">Yuborish</button>
              </form>
            </Modal>
          )}

          {/* 4. Windows Ilova Modali */}
          {activeModal === "windows" && (
            <Modal title={t("install_windows_app")} onClose={() => setActiveModal(null)}>
              <p className="text-secondary small mb-3">Rasmiy Windows desktop ilovamizni o'rnating.</p>
              <a href="#" className="btn btn-success w-100 rounded-pill py-2 text-decoration-none d-block text-center" onClick={() => alert("Yuklanmoqda...")}>
                <i className="bi bi-download me-2"></i> Yuklab olish (.exe)
              </a>
            </Modal>
          )}
        </>,
        document.body
      )}

    </div>
  );
};

export default Sidebar;
