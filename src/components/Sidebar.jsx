import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
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
      className="d-flex flex-column align-items-center py-3 bg-white border-end position-relative"
      style={{ width: "64px", minHeight: "100vh", position: "sticky", top: 0, zIndex: 20 }}
    >
      <Link to="/" className="text-danger mb-4 fs-3">
        <i className="bi bi-pinterest"></i>
      </Link>

      <Link to="/" className="text-dark mb-4 fs-5" title="Bosh sahifa">
        <i className="bi bi-house-fill"></i>
      </Link>

      <button
        className="btn border-0 text-dark mb-4 fs-5"
        title="Boardlarim"
        onClick={() => goProtected("/boards")}
      >
        <i className="bi bi-grid-fill"></i>
      </button>

      <button
        className="btn border-0 text-dark mb-4 fs-5"
        title="Yaratish"
        onClick={() => goProtected("/pin/create")}
      >
        <i className="bi bi-plus-square"></i>
      </button>

      <button
        className="btn border-0 text-dark mb-4 fs-5 position-relative"
        title="Xabarlar"
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
              className="btn border-0 p-0"
              onClick={() => setShowAccount((v) => !v)}
              title="Profil"
            >
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white"
                style={{ width: "32px", height: "32px", fontSize: "13px" }}
              >
                {user.firstname ? user.firstname[0].toUpperCase() : "U"}
              </div>
            </button>

            {showAccount && (
              <div
                className="position-absolute bg-white rounded-3 shadow p-3"
                style={{ left: "56px", bottom: 0, width: "220px" }}
              >
                <p className="text-secondary small mb-2">Currently in</p>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white"
                    style={{ width: "36px", height: "36px" }}
                  >
                    {user.firstname ? user.firstname[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="mb-0 fw-medium">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="mb-0 text-secondary small">{user.email}</p>
                  </div>
                  <i className="bi bi-check-lg ms-auto"></i>
                </div>
                <hr className="my-2" />
                <button
                  className="btn btn-light w-100 text-start"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            className="btn border-0 text-dark fs-5"
            title="Kirish"
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
          title="Sozlamalar"
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
              <p className="fw-medium mb-0">Settings &amp; Support</p>
              <button
                className="btn btn-sm border-0"
                onClick={() => setShowSettings(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              <span className="small">Settings</span>
              <span className="small">Refine your recommendations</span>
              <span className="small">Link to Pinterest</span>
              <span className="small">Reports and violations center</span>
              <span className="small">Install the Windows app</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
