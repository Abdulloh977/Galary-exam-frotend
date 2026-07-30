import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom"; 
import useAuth from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

// 1. BU YERDA: onToggleSidebar props qabul qilindi
const Sidebar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState(["nature", "tech", "design"]);
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("spam");

  const goProtected = (path) => {
    if (!user) navigate("/login");
    else navigate(path);
  };

  const handleInterestChange = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // 💡 YANGI QO'SHILDI: Tanlangan manfaatlarni URL-ga so'rov (query) qilib yuboradigan funksiya
  const handleSaveRecommendations = () => {
    const tagsQuery = selectedInterests.join(",");
    setActiveModal(null);
    // Bosh sahifaga interests parametri bilan yo'naltiramiz, Home.jsx buni o'qib filtrlaydi
    navigate(`/?interests=${tagsQuery}`);
  };

  return (
    <div
      className="d-flex flex-column align-items-center py-3 sidebar-nav"
      style={{ width: "64px", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 30 }}
    >
      {/* Pinterest Logotipi */}
      <Link to="/" className="text-danger mb-2 fs-3 sidebar-icon-btn">
        <i className="bi bi-pinterest"></i>
      </Link>

      {/* 2. YANGI QO'SHILDI: Uchta chiziqchali yopish tugmasi (Faqat telefonda chiqadi: d-md-none) */}
      <button
        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm mb-4 d-md-none"
        style={{ width: "32px", height: "32px" }}
        onClick={onToggleSidebar}
        type="button"
      >
        <i className="bi bi-list fs-5 fw-bold"></i>
      </button>

      {/* Navigatsiya iqonchalari */}
      <Link to="/" className="text-dark mb-4 fs-5 sidebar-icon-btn" title={t("sidebar_home")}>
        <i className="bi bi-house-fill"></i>
      </Link>

      <button className="btn border-0 text-dark mb-4 fs-5 sidebar-icon-btn" title={t("sidebar_boards")} onClick={() => goProtected("/boards")}>
        <i className="bi bi-grid-fill"></i>
      </button>

      <button className="btn border-0 text-dark mb-4 fs-5 sidebar-icon-btn" title={t("sidebar_create")} onClick={() => goProtected("/pin/create")}>
        <i className="bi bi-plus-square"></i>
      </button>

      <button className="btn border-0 text-dark mb-4 fs-5 position-relative sidebar-icon-btn" title={t("sidebar_chat")} onClick={() => goProtected("/chat")}>
        <i className="bi bi-chat-dots"></i>
      </button>

      <button className="btn border-0 text-dark mb-4 fs-5 sidebar-icon-btn" title={theme === "dark" ? t("day_mode") : t("night_mode")} onClick={toggleTheme}>
        <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}></i>
      </button>

      <div className="flex-grow-1"></div>
      {/* Sozlamalar Popup qismi */}
      <div className="position-relative">
        <button className="btn border-0 text-dark fs-5 sidebar-icon-btn" title={t("settings")} onClick={() => setShowSettings((v) => !v)}>
          <i className="bi bi-gear"></i>
        </button>

               {/* 💡 TO'G'RILANDI: Ko'rinmay qolishiga sabab bo'lgan animatsiya klasslari olib tashlandi */}
        {showSettings && createPortal(
          <div 
            className="position-fixed bg-white rounded-4 shadow-lg p-3" 
            style={{ 
              left: "74px",     // Sidebardan 10px o'ngda
              bottom: "16px",   // Ekranning shundoq pastki qismida
              width: "290px", 
              zIndex: 9999,     // Mutlaqo hamma narsadan ustida turishi uchun eng yuqori qiymat
              border: "1px solid #EFEFEF",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)"
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
              <button className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "13px" }} onClick={() => { setShowSettings(false); if (!user) navigate("/login"); else navigate("/profile/edit"); }}>
                <i className="bi bi-person-gear fs-6 text-dark"></i> {t("settings")}
              </button>
              <button className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "13px" }} onClick={() => { setActiveModal("tavsiya"); setShowSettings(false); }}>
                <i className="bi bi-sliders fs-6 text-dark"></i> {t("refine_recommendations")}
              </button>
              <button className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "13px" }} onClick={() => { setActiveModal("pinterest"); setShowSettings(false); }}>
                <i className="bi bi-pinterest fs-6 text-danger"></i> {t("link_pinterest") || "Pinterest bilan bog'lash"}
              </button>
              <button className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "13px" }} onClick={() => { setActiveModal("shikoyat"); setShowSettings(false); }}>
                <i className="bi bi-exclamation-triangle fs-6 text-warning"></i> {t("reports_violations")}
              </button>
              <button className="btn btn-light text-start border-0 py-2 px-2 rounded-3 text-secondary d-flex align-items-center gap-2" style={{ fontSize: "13px" }} onClick={() => { setActiveModal("windows"); setShowSettings(false); }}>
                <i className="bi bi-windows fs-6 text-primary"></i> {t("install_windows_app") || "Windows ilovasini o'rnatish"}
              </button>
            </div>
          </div>,
          document.body
        )}

      </div>

      {/* ================= MODALLAR PORTALI ================= */}
      {activeModal && createPortal(
        <div className="modal-fade-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: "90%", maxWidth: "450px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0 fw-bold">
                {activeModal === "tavsiya" && t("refine_recommendations")}
                {activeModal === "shikoyat" && t("reports_violations")}
                {activeModal === "pinterest" && (t("link_pinterest") || "Pinterest bilan bog'lash")}
                {activeModal === "windows" && (t("install_windows_app") || "Windows ilovasini o'rnatish")}
              </h5>
              <button className="btn border-0 p-0 text-secondary" onClick={() => setActiveModal(null)}><i className="bi bi-x-lg"></i></button>
            </div>

            {/* 1. Tavsiyalar Modali */}
            {activeModal === "tavsiya" && (
              <>
                <div className="d-flex flex-wrap gap-2 mb-4" style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {[
                    { id: "nature", label: "Tabiat va Manzaralar" },
                    { id: "cars", label: "Avtomobillar" },
                    { id: "tech", label: "Texnologiyalar" },
                    { id: "anime", label: "Anime san'ati" },
                    { id: "food", label: "Taom va Retseptlar" }
                  ].map((topic) => {
                    const isChecked = selectedInterests.includes(topic.id);
                    return (
                      <button key={topic.id} type="button" className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${isChecked ? "btn-dark" : "btn-outline-secondary"}`} onClick={() => handleInterestChange(topic.id)}>
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
                <button className="btn btn-danger w-100 rounded-pill" style={{ backgroundColor: "#E60023" }} onClick={handleSaveRecommendations}>
                  {t("save") || "Saqlash"}
                </button>
              </>
            )}

            {/* 2. Pinterest Modali */}
            {activeModal === "pinterest" && (
              <>
                <p className="text-secondary small mb-3">Akkauntingizni rasmiy Pinterest tizimi bilan integratsiya qiling.</p>
                <button className="btn btn-danger w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2" style={{ backgroundColor: "#E60023" }} onClick={() => { alert("Ulanmoqda..."); setActiveModal(null); }}>
                  <i className="bi bi-pinterest fs-5"></i> Pinterest hisobiga ulanish
                </button>
              </>
            )}

            {/* 3. Shikoyatlar Modali */}
            {activeModal === "shikoyat" && (
              <form onSubmit={(e) => { e.preventDefault(); alert("Yuborildi!"); setActiveModal(null); }}>
                <select className="form-select rounded-3 mb-3" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="spam">Spam yoki firgarlik</option>
                  <option value="abuse">Haqorat yoki zo'ravonlik</option>
                </select>
                <textarea 
                  className="form-control rounded-3 mb-3" 
                  rows="3" 
                  placeholder="Muammoni shu yerda yozib qoldiring..." 
                  value={reportText} 
                  onChange={(e) => setReportText(e.target.value)}
                ></textarea>
                <button type="submit" className="btn btn-primary w-100 rounded-pill">
                  Yuborish
                </button>
              </form>
            )}

            {/* 4. Windows Ilova Modali */}
            {activeModal === "windows" && (
              <>
                <p className="text-secondary small mb-3">Rasmiy Windows desktop ilovamizni o'rnating.</p>
                <a href="#" className="btn btn-success w-100 rounded-pill py-2 text-decoration-none d-block text-center" onClick={() => { alert("Yuklanmoqda..."); setActiveModal(null); }}>
                  <i className="bi bi-download me-2"></i> Yuklab olish (.exe)
                </a>
              </>
            )}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Sidebar;
