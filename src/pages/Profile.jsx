import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import TopBar from "../components/TopBar";
import Loader from "../components/Loader";
import MasonryGrid from "../components/MasonryGrid";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getProfileApi } from "../api/userApi";
import { deletePinApi, updatePinApi } from "../api/pinApi";

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

  const handleDeletePin = async (pinId) => {
    const confirmed = window.confirm(t("confirm_delete_pin"));
    if (!confirmed) return;
    try {
      await deletePinApi(pinId);
      setPins((prev) => prev.filter((p) => p._id !== pinId));
    } catch (error) {
      console.error("Rasmni o'chirishda xatolik:", error);
    }
  };

  // 💡 CHAQIRILISHI: Uchta nuqta va maxfiylik tugmasi bosilganda ishlaydigan asosiy funksiya
  const handleTogglePrivacy = async (pinId, isChecked) => {
    try {
      await updatePinApi(pinId, { isPrivate: isChecked });
      setPins((prevPins) =>
        prevPins.map((pin) =>
          pin._id === pinId ? { ...pin, isPrivate: isChecked } : pin
        )
      );
    } catch (error) {
      console.error("Rasm maxfiylik holatini o'zgartirishda xatolik:", error);
    }
  };

  if (loading) return <PageLayout topBar={<TopBar />}><Loader /></PageLayout>;
  if (!profileUser) return <PageLayout topBar={<TopBar />}><p>Not found</p></PageLayout>;

  return (
    /* 💡 TO'G'RILANDI: Unknown event handler xatosini bergan qism olib tashlandi, PageLayout toza holatga keltirildi */
    <PageLayout topBar={<TopBar />}>
      
      {/* Profil ma'lumotlari bo'limi (Telefon versiyaga mos responsive) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start mb-4 text-center text-md-start gap-3">
        <div className="d-flex flex-column flex-md-row align-items-center gap-3">
          <div 
            className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0" 
            style={{ width: "64px", height: "64px", fontSize: "28px", fontWeight: "600" }}
          >
            {profileUser.profilePicture ? (
              <img src={`http://localhost:4000/public/${profileUser.profilePicture}`} alt="avatar" className="w-100 h-100" style={{ objectFit: "cover" }} />
            ) : (
              profileUser.firstname ? profileUser.firstname[0].toUpperCase() : "U"
            )}
          </div>
          <div>
            <h3 className="mb-1 fs-4 fw-bold">{profileUser.firstname} {profileUser.lastname}</h3>
            <p className="text-secondary small mb-0">@{profileUser.username}</p>
          </div>
        </div>

        {/* Tugmalar (Kichraytirilgan responsive variant) */}
        <div className="d-flex gap-2 flex-wrap justify-content-center">
          <button className="btn btn-light btn-sm rounded-pill px-3 py-2 fw-medium shadow-sm" onClick={handleShareProfile}>
            <i className="bi bi-share me-1"></i>
            <span className="small">{copied ? t("copied") : t("share_profile")}</span>
          </button>
          
          {isOwnProfile ? (
            <>
              <Link to="/profile/edit" className="btn btn-light btn-sm rounded-pill px-3 py-2 fw-medium shadow-sm">
                <i className="bi bi-pencil me-1"></i> 
                <span className="small">{t("edit_profile")}</span>
              </Link>
              <Link to="/pin/create" className="btn btn-danger btn-sm rounded-pill px-3 py-2 fw-medium shadow-sm">
                <i className="bi bi-plus-lg me-1"></i> 
                <span className="small">{t("sidebar_create")}</span>
              </Link>
            </>
          ) : (
            <button className="btn btn-danger btn-sm rounded-pill px-3 py-2 fw-medium shadow-sm" onClick={handleSendMessage}>
              <i className="bi bi-chat-dots me-1"></i> 
              <span className="small">{t("send_message")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tablar bo'limi */}
      <div className="d-flex gap-4 border-bottom mb-4 justify-content-center justify-content-md-start">
        <button className={`btn border-0 rounded-0 pb-2 ${activeTab === "pins" ? "border-bottom border-dark border-2 fw-medium" : "text-secondary"}`} onClick={() => setActiveTab("pins")}>{t("pins_tab")}</button>
        <button className={`btn border-0 rounded-0 pb-2 ${activeTab === "boards" ? "border-bottom border-dark border-2 fw-medium" : "text-secondary"}`} onClick={() => setActiveTab("boards")}>{t("boards_tab")}</button>
      </div>

      {/* Kontent qismi */}
      {activeTab === "pins" ? (
        <div className="w-100 overflow-hidden">
          {/* 💡 TO'G'RILANDI: onTogglePrivacy mantiqlari bevosita MasonryGrid'ning o'ziga ulandi, endi uchta nuqta va uning ichidagi checkbox to'liq ishlaydi */}
          <MasonryGrid 
            pins={pins} 
            showDeleteButton={isOwnProfile} 
            onDeleteClick={handleDeletePin} 
            onTogglePrivacy={handleTogglePrivacy} 
          />
        </div>
      ) : boards.length === 0 ? (
        <p className="text-secondary text-center text-md-start mt-3">{t("no_boards_yet")}</p>
      ) : (
        <div className="row g-3">
          {boards.map((board) => (
            <div className="col-6 col-md-4 col-lg-3" key={board._id}>
              <Link to={`/board/${board._id}`} className="text-decoration-none text-dark">
                <div className="rounded-4 bg-light d-flex align-items-center justify-content-center mb-2" style={{ height: "140px" }}><i className="bi bi-folder fs-1 text-secondary"></i></div>
                <p className="mb-0 fw-medium text-truncate text-center text-md-start">{board.title}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Profile;
