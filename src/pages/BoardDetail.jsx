import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getOneBoardApi, updateBoardApi, deleteBoardApi, addPinToBoardApi } from "../api/boardApi";
import { getProfileApi } from "../api/userApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const BoardDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [myPins, setMyPins] = useState([]);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await getOneBoardApi(id);
      setBoard(res.data.board);
    } catch (error) {
      console.error("Kategoriyani yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const openEditModal = () => {
    setEditTitle(board.title);
    setShowEditModal(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (editTitle.trim() === "") return;
    try {
      await updateBoardApi(id, { title: editTitle.trim() });
      setShowEditModal(false);
      fetchBoard();
    } catch (error) {
      console.error("Kategoriyani yangilashda xatolik:", error);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(t("confirm_delete_board"));
    if (!confirmed) return;

    try {
      await deleteBoardApi(id);
      navigate("/boards");
    } catch (error) {
      console.error("Kategoriyani o'chirishda xatolik:", error);
    }
  };

  // "+" tugmasi — o'zining pinlari ro'yxatini olib, tanlashga taklif qiladi
  const openAddModal = async () => {
    try {
      const res = await getProfileApi(user._id);
      const boardPinIds = board.pins.map((p) => p._id);
      setMyPins(res.data.pins.filter((p) => !boardPinIds.includes(p._id)));
      setShowAddModal(true);
    } catch (error) {
      console.error("Pinlarni yuklashda xatolik:", error);
    }
  };

  const handleAddPin = async (pinId) => {
    try {
      await addPinToBoardApi({ boardId: id, pinId });
      setMyPins((prev) => prev.filter((p) => p._id !== pinId));
      fetchBoard();
    } catch (error) {
      console.error("Rasmni qo'shishda xatolik:", error);
    }
  };

  return (
    <PageLayout>
      <Link to="/boards" className="text-decoration-none text-secondary small mb-3 d-inline-block">
        <i className="bi bi-arrow-left me-1"></i> {t("back_to_boards")}
      </Link>

      {loading ? (
        <Loader />
      ) : !board ? (
        <p>Not found</p>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="mb-0">{board.title}</h3>
            <div className="d-flex gap-2">
              <button className="btn btn-danger rounded-pill btn-sm" onClick={openAddModal}>
                <i className="bi bi-plus-lg me-1"></i> {t("sidebar_create")}
              </button>
              <button className="btn btn-light rounded-pill btn-sm" onClick={openEditModal}>
                <i className="bi bi-pencil me-1"></i> {t("edit")}
              </button>
              <button className="btn btn-light text-danger rounded-pill btn-sm" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i> {t("delete")}
              </button>
            </div>
          </div>

          {board.pins.length === 0 ? (
            <p className="text-secondary">{t("no_images_yet")}</p>
          ) : (
            <div style={{ columnCount: 5, columnGap: "12px" }}>
              {board.pins.map((pin) => (
                <div key={pin._id} style={{ breakInside: "avoid" }} className="mb-3">
                  <Link to={`/pin/${pin._id}`}>
                    <img
                      src={`${IMAGE_BASE_URL}/${pin.imageUrl}`}
                      alt={pin.title}
                      className="w-100 rounded-4 d-block"
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showEditModal && (
        <Modal title={t("rename_board_title")} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleRename} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
            />
            <button className="btn btn-dark" type="submit">
              {t("save")}
            </button>
          </form>
        </Modal>
      )}

      {showAddModal && (
        <Modal title={t("add_pins_title")} onClose={() => setShowAddModal(false)}>
          {myPins.length === 0 ? (
            <p className="text-secondary small">{t("no_pins_to_add")}</p>
          ) : (
            <div className="row g-2">
              {myPins.map((pin) => (
                <div
                  className="col-4"
                  key={pin._id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAddPin(pin._id)}
                >
                  <img
                    src={`${IMAGE_BASE_URL}/${pin.imageUrl}`}
                    alt={pin.title}
                    className="w-100 rounded-3"
                    style={{ height: "80px", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </PageLayout>
  );
};

export default BoardDetail;
