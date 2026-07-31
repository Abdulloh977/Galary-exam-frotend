import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import TopBar from "../components/TopBar";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import CommentList from "../components/CommentList";
import useAuth from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext";
import { getOnePinApi, likePinApi } from "../api/pinApi";
import { getPinCommentsApi } from "../api/commentApi";
import { getMyBoardsApi, createBoardApi, addPinToBoardApi } from "../api/boardApi";
import { downloadImage } from "../utils/download";
import { useToast } from "../context/ToastContext";
import ShareMenu from "../components/ShareMenu";

const IMAGE_BASE_URL = "https://galary-exam.onrender.com/public";

// Tugmalar bitta qatorga chiroyli sig'ishi uchun ixcham inline uslublar
const btnInlineStyle = { padding: "6px 12px", fontSize: "13px", whiteSpace: "nowrap" };

const PinDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [pin, setPin] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [myBoards, setMyBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pinRes, commentsRes] = await Promise.all([
          getOnePinApi(id),
          getPinCommentsApi(id),
        ]);

        setPin(pinRes.data.pin);
        setLikesCount(pinRes.data.pin.likes.length);
        if (user) {
          setLiked(pinRes.data.pin.likes.includes(user._id));
        }
        setComments(commentsRes.data.comments);
      } catch (error) {
        console.error("Pinni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const requireLogin = () => {
    if (!user) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleLike = async () => {
    if (requireLogin()) return;
    try {
      const res = await likePinApi(id);
      setLiked((prev) => !prev);
      setLikesCount(res.data.likesCount);
    } catch (error) {
      console.error("Like bosishda xatolik:", error);
    }
  };

  const openSaveModal = async () => {
    if (requireLogin()) return;
    try {
      const res = await getMyBoardsApi();
      setMyBoards(res.data.boards);
      setShowSaveModal(true);
    } catch (error) {
      console.error("Kategoriyalarni yuklashda xatolik:", error);
    }
  };

  const handleSaveToBoard = async (boardId) => {
    try {
      await addPinToBoardApi({ boardId, pinId: id });
      setShowSaveModal(false);
    } catch (error) {
      console.error("Kategoriyaga saqlashda xatolik:", error);
    }
  };

  const handleCreateBoardAndSave = async (e) => {
    e.preventDefault();
    if (newBoardTitle.trim() === "") return;
    try {
      const res = await createBoardApi({ title: newBoardTitle.trim() });
      await addPinToBoardApi({ boardId: res.data.board._id, pinId: id });
      setNewBoardTitle("");
      setShowSaveModal(false);
    } catch (error) {
      console.error("Kategoriya yaratishda xatolik:", error);
    }
  };

  const handleShare = () => {
    if (requireLogin()) return;
    setShowShareMenu(true);
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (requireLogin()) return;
    downloadImage(`${IMAGE_BASE_URL}/${pin.imageUrl}`, pin.imageUrl || `${pin.title || "pin"}.jpg`);
  };

  if (loading) {
    return (
      <PageLayout topBar={<TopBar />}>
        <Loader />
      </PageLayout>
    );
  }

  if (!pin) {
    return (
      <PageLayout topBar={<TopBar />}>
        <p>Not found</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout topBar={<TopBar />}>
      <div className="row g-4" style={{ maxWidth: "900px" }}>
        {/* Rasm qismi */}
        <div className="col-md-6">
          <img
            src={`${IMAGE_BASE_URL}/${pin.imageUrl}`}
            alt={pin.title}
            className="w-100 rounded-4"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Ma'lumotlar qismi */}
        <div className="col-md-6">
          {/* 💡 TUZATILDI: flex-nowrap qilindi, tugmalar bitta qatorda, pastga tushib ketmaydi */}
                    {/* 💡 TUZATILDI: Save yozuvi butunlay olib tashlandi, faqat ikonka Yuklash tugmasining yoniga joylandi */}
          <div className="d-flex gap-2 mb-3 flex-nowrap align-items-center w-100 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              className={`btn ${liked ? "btn-danger" : "btn-outline-danger"} rounded-pill d-flex align-items-center justify-content-center`}
              style={{ padding: "6px 14px", fontSize: "13px", whiteSpace: "nowrap" }}
              onClick={handleLike}
            >
              <i className="bi bi-heart-fill me-1"></i> {likesCount}
            </button>

            <div className="position-relative">
              <button
                className="btn btn-outline-secondary rounded-pill d-flex align-items-center justify-content-center"
                style={{ padding: "6px 14px", fontSize: "13px", whiteSpace: "nowrap" }}
                onClick={handleShare}
              >
                <i className="bi bi-share me-1"></i>
                {t("share")}
              </button>

              {showShareMenu && (
                <ShareMenu
                  url={window.location.href}
                  title={pin.title}
                  onClose={() => setShowShareMenu(false)}
                  style={{ left: 0, top: "44px" }}
                />
              )}
            </div>

            <button
              className="btn btn-outline-secondary rounded-pill d-flex align-items-center justify-content-center"
              style={{ padding: "6px 14px", fontSize: "13px", whiteSpace: "nowrap" }}
              onClick={handleDownloadClick}
            >
              <i className="bi bi-download me-1"></i> {t("download")}
            </button>

            {/* 💡 MANA SHU YERDA: Matn o'chirildi, faqat yuklash yonidagi chiroyli dumaloq ikonka qoldi */}
            <button
              className="btn btn-dark rounded-pill d-flex align-items-center justify-content-center"
              style={{ padding: "6px 14px", fontSize: "13px" }}
              onClick={openSaveModal}
              title={t("save") || "Save"}
            >
              <i className="bi bi-bookmark-fill"></i>
            </button>
          </div>


          <h4>{pin.title}</h4>
          <p className="text-secondary">{pin.description}</p>

          <div className="d-flex gap-3 text-secondary small mb-3">
            <span>
              <i className="bi bi-eye me-1"></i> {pin.views} {t("views")}
            </span>
            <span>
              <i className="bi bi-heart me-1"></i> {likesCount} {t("likes")}
            </span>
          </div>

          {pin.tags && pin.tags.length > 0 && (
            <div className="d-flex gap-2 flex-wrap mb-3">
              {pin.tags.map((tag) => (
                <span key={tag} className="badge bg-light text-dark border">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <Link
            to={`/profile/${pin.owner._id}`}
            className="d-flex align-items-center gap-2 text-decoration-none text-dark mb-3"
          >
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white overflow-hidden flex-shrink-0"
              style={{ width: "36px", height: "36px" }}
            >
              {pin.owner.profilePicture ? (
                <img
                  src={`${IMAGE_BASE_URL}/${pin.owner.profilePicture}`}
                  alt="avatar"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                pin.owner.firstname ? pin.owner.firstname.toUpperCase() : "U"
              )}
            </div>
            <span className="small fw-medium">
              {pin.owner.firstname} {pin.owner.lastname}
            </span>
          </Link>

          <CommentList
            pinId={pin._id}
            pinOwnerId={pin.owner._id}
            comments={comments}
            onCommentAdded={(newComment) =>
              setComments((prev) => [...prev, newComment])
            }
            onCommentDeleted={(commentId) =>
              setComments((prev) =>
                prev.filter((c) => c._id !== commentId && c.parentComment !== commentId)
              )
            }
            onCommentUpdated={(updatedComment) =>
              setComments((prev) =>
                prev.map((c) => (c._id === updatedComment._id ? updatedComment : c))
              )
            }
          />
        </div>
      </div>

      {showSaveModal && (
        <Modal title={t("save_to_board")} onClose={() => setShowSaveModal(false)}>
          {myBoards.length === 0 ? (
            <p className="text-secondary small">{t("no_boards_yet")}</p>
          ) : (
            <div className="d-flex flex-column gap-2 mb-3">
              {myBoards.map((board) => (
                <button
                  key={board._id}
                  className="btn btn-outline-dark text-start"
                  onClick={() => handleSaveToBoard(board._id)}
                >
                  <i className="bi bi-folder me-2"></i>
                  {board.title}
                </button>
              ))}
            </div>
          )}

        <hr />

        <form onSubmit={handleCreateBoardAndSave} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder={t("new_board_placeholder")}
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
          />
          <button className="btn btn-dark" type="submit">
            {t("create")}
          </button>
        </form>
      </Modal>
    )}
  </PageLayout>
);
};

export default PinDetail;
