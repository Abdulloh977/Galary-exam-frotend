import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getMyBoardsApi,
  createBoardApi,
  updateBoardApi,
  deleteBoardApi,
} from "../api/boardApi";

const Boards = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const [editingBoard, setEditingBoard] = useState(null); // { _id, title }
  const [editTitle, setEditTitle] = useState("");

  // 5 ta tayyor (tavsiya etilgan) kategoriya — tilga qarab o'zgaradi
  const suggestedCategories = [
    { icon: "bi-tree", label: t("category_nature") },
    { icon: "bi-airplane", label: t("category_travel") },
    { icon: "bi-bag-heart", label: t("category_fashion") },
    { icon: "bi-cup-hot", label: t("category_food") },
    { icon: "bi-palette", label: t("category_art") },
  ];

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await getMyBoardsApi();
      setBoards(res.data.boards);
    } catch (error) {
      console.error("Kategoriyalarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBoards();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newTitle.trim() === "") return;
    try {
      await createBoardApi({ title: newTitle.trim() });
      setNewTitle("");
      fetchBoards();
    } catch (error) {
      console.error("Kategoriya yaratishda xatolik:", error);
    }
  };

  // Tavsiya etilgan kategoriyaga bosilganda — darhol yaratiladi
  const handleQuickCreate = async (label) => {
    // Agar shu nom bilan kategoriya allaqachon bo'lsa, qayta yaratmaymiz
    const alreadyExists = boards.some(
      (b) => b.title.toLowerCase() === label.toLowerCase()
    );
    if (alreadyExists) return;

    try {
      await createBoardApi({ title: label });
      fetchBoards();
    } catch (error) {
      console.error("Kategoriya yaratishda xatolik:", error);
    }
  };

  const openEditModal = (board) => {
    setEditingBoard(board);
    setEditTitle(board.title);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (editTitle.trim() === "") return;
    try {
      await updateBoardApi(editingBoard._id, { title: editTitle.trim() });
      setEditingBoard(null);
      fetchBoards();
    } catch (error) {
      console.error("Kategoriyani yangilashda xatolik:", error);
    }
  };

  const handleDelete = async (boardId) => {
    const confirmed = window.confirm(t("confirm_delete_board"));
    if (!confirmed) return;

    try {
      await deleteBoardApi(boardId);
      fetchBoards();
    } catch (error) {
      console.error("Kategoriyani o'chirishda xatolik:", error);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4">
        <h3 className="mb-4">{t("my_boards")}</h3>

        {/* Yangi kategoriya yaratish formasi */}
        <form onSubmit={handleCreate} className="d-flex gap-2 mb-3" style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control"
            placeholder={t("create_board_placeholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button className="btn btn-dark" type="submit">
            <i className="bi bi-plus-lg me-1"></i> {t("create")}
          </button>
        </form>

        {/* 5 ta tayyor kategoriya */}
        <p className="text-secondary small mb-2">{t("suggested_categories")}</p>
        <div className="d-flex gap-2 flex-wrap mb-4">
          {suggestedCategories.map((cat) => (
            <button
              key={cat.label}
              className="btn btn-outline-dark rounded-pill btn-sm"
              onClick={() => handleQuickCreate(cat.label)}
            >
              <i className={`bi ${cat.icon} me-1`}></i>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : boards.length === 0 ? (
          <p className="text-secondary">{t("no_boards_yet")}</p>
        ) : (
          <div className="row g-3">
            {boards.map((board) => (
              <div className="col-6 col-md-4 col-lg-3" key={board._id}>
                <div className="position-relative">
                  <Link
                    to={`/board/${board._id}`}
                    className="text-decoration-none text-dark"
                  >
                    <div
                      className="rounded-4 bg-light d-flex align-items-center justify-content-center mb-2"
                      style={{ height: "140px" }}
                    >
                      <i className="bi bi-folder fs-1 text-secondary"></i>
                    </div>
                    <p className="mb-0 fw-medium text-truncate">{board.title}</p>
                    <p className="mb-0 small text-secondary">
                      {board.pins ? board.pins.length : 0} {t("images_count")}
                    </p>
                  </Link>

                  {/* Tahrirlash / O'chirish tugmalari */}
                  <div className="position-absolute top-0 end-0 d-flex gap-1 p-1">
                    <button
                      className="btn btn-sm btn-white bg-white rounded-circle shadow-sm"
                      style={{ width: "28px", height: "28px" }}
                      onClick={() => openEditModal(board)}
                      title={t("edit")}
                    >
                      <i className="bi bi-pencil" style={{ fontSize: "12px" }}></i>
                    </button>
                    <button
                      className="btn btn-sm btn-white bg-white rounded-circle shadow-sm"
                      style={{ width: "28px", height: "28px" }}
                      onClick={() => handleDelete(board._id)}
                      title={t("delete")}
                    >
                      <i className="bi bi-trash text-danger" style={{ fontSize: "12px" }}></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingBoard && (
        <Modal title={t("rename_board_title")} onClose={() => setEditingBoard(null)}>
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

export default Boards;
