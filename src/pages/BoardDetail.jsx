import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import MasonryGrid from "../components/MasonryGrid";
import { useLanguage } from "../context/LanguageContext";
import { getOneBoardApi, updateBoardApi, deleteBoardApi } from "../api/boardApi";

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");

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

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4">
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
                <button className="btn btn-light rounded-pill btn-sm" onClick={openEditModal}>
                  <i className="bi bi-pencil me-1"></i> {t("edit")}
                </button>
                <button className="btn btn-light text-danger rounded-pill btn-sm" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i> {t("delete")}
                </button>
              </div>
            </div>
            <MasonryGrid pins={board.pins} />
          </>
        )}
      </div>

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
    </div>
  );
};

export default BoardDetail;
