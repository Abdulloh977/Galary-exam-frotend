import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import CommentList from "../components/CommentList";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getOnePinApi, likePinApi } from "../api/pinApi";
import { getPinCommentsApi } from "../api/commentApi";
import { getMyBoardsApi, createBoardApi, addPinToBoardApi } from "../api/boardApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";

// Harakat tugmalari uchun umumiy uslub — balandligi kamroq, kengligi kattaroq
const actionBtnStyle = { padding: "6px 22px", fontSize: "14px" };

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
  const [copied, setCopied] = useState(false);

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
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadClick = (e) => {
    if (requireLogin()) {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Loader />
      </PageLayout>
    );
  }

  if (!pin) {
    return (
      <PageLayout>
        <p>Not found</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="row g-4" style={{ maxWidth: "900px" }}>
        {/* Rasm */}
        <div className="col-md-6">
          <img
            src={`${IMAGE_BASE_URL}/${pin.imageUrl}`}
            alt={pin.title}
            className="w-100 rounded-4"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Ma'lumotlar */}
        <div className="col-md-6">
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <button
              className={`btn ${liked ? "btn-danger" : "btn-outline-danger"} rounded-pill`}
              style={actionBtnStyle}
              onClick={handleLike}
            >
              <i className="bi bi-heart-fill me-1"></i> {likesCount}
            </button>

            <button
              className="btn btn-outline-secondary rounded-pill"
              style={actionBtnStyle}
              onClick={handleShare}
            >
              <i className="bi bi-share me-1"></i>
              {copied ? t("copied") : t("share")}
            </button>

            <a
              href={`${IMAGE_BASE_URL}/${pin.imageUrl}`}
              download
              className="btn btn-outline-secondary rounded-pill"
              style={actionBtnStyle}
              onClick={handleDownloadClick}
            >
              <i className="bi bi-download me-1"></i> {t("download")}
            </a>

            <button
              className="btn btn-dark rounded-pill ms-auto"
              style={actionBtnStyle}
              onClick={openSaveModal}
            >
              <i className="bi bi-bookmark-fill me-1"></i> {t("save_pin")}
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
                pin.owner.firstname ? pin.owner.firstname[0].toUpperCase() : "U"
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
