import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Loader from "../components/Loader";
import MasonryGrid from "../components/MasonryGrid";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getProfileApi } from "../api/userApi";

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [pins, setPins] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeTab, setActiveTab] = useState("pins");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isOwnProfile = currentUser && currentUser._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfileApi(id);
        setProfileUser(res.data.user);
        setPins(res.data.pins);
        setBoards(res.data.boards);
      } catch (error) {
        console.error("Profilni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate(`/chat/${id}`);
  };

  if (loading) {
    return (
      <PageLayout>
        <Loader />
      </PageLayout>
    );
  }

  if (!profileUser) {
    return (
      <PageLayout>
        <p>Not found</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div
            className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white mb-2 overflow-hidden"
            style={{ width: "64px", height: "64px", fontSize: "24px" }}
          >
            {profileUser.profilePicture ? (
              <img
                src={`http://localhost:4000/public/${profileUser.profilePicture}`}
                alt="avatar"
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            ) : (
              profileUser.firstname ? profileUser.firstname[0].toUpperCase() : "U"
            )}
          </div>
          <h3 className="mb-1">
            {profileUser.firstname} {profileUser.lastname}
          </h3>
          <p className="text-secondary small mb-0">@{profileUser.username}</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-light rounded-pill" onClick={handleShareProfile}>
            <i className="bi bi-share me-1"></i>
            {copied ? t("copied") : t("share_profile")}
          </button>

          {isOwnProfile ? (
            <>
              <Link to="/profile/edit" className="btn btn-light rounded-pill">
                <i className="bi bi-pencil me-1"></i> {t("edit_profile")}
              </Link>
              <Link to="/pin/create" className="btn btn-danger rounded-pill">
                <i className="bi bi-plus-lg me-1"></i> {t("sidebar_create")}
              </Link>
            </>
          ) : (
            <button className="btn btn-danger rounded-pill" onClick={handleSendMessage}>
              <i className="bi bi-chat-dots me-1"></i> {t("send_message")}
            </button>
          )}
        </div>
      </div>

      {/* Tablar */}
      <div className="d-flex gap-4 border-bottom mb-4">
        <button
          className={`btn border-0 rounded-0 pb-2 ${
            activeTab === "pins" ? "border-bottom border-dark border-2 fw-medium" : "text-secondary"
          }`}
          onClick={() => setActiveTab("pins")}
        >
          {t("pins_tab")}
        </button>
        <button
          className={`btn border-0 rounded-0 pb-2 ${
            activeTab === "boards" ? "border-bottom border-dark border-2 fw-medium" : "text-secondary"
          }`}
          onClick={() => setActiveTab("boards")}
        >
          {t("boards_tab")}
        </button>
      </div>

      {activeTab === "pins" ? (
        <MasonryGrid pins={pins} />
      ) : boards.length === 0 ? (
        <p className="text-secondary">{t("no_boards_yet")}</p>
      ) : (
        <div className="row g-3">
          {boards.map((board) => (
            <div className="col-6 col-md-4 col-lg-3" key={board._id}>
              <Link to={`/board/${board._id}`} className="text-decoration-none text-dark">
                <div
                  className="rounded-4 bg-light d-flex align-items-center justify-content-center mb-2"
                  style={{ height: "140px" }}
                >
                  <i className="bi bi-folder fs-1 text-secondary"></i>
                </div>
                <p className="mb-0 fw-medium text-truncate">{board.title}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Profile;
