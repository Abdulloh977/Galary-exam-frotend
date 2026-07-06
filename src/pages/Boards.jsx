import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { getProfileApi } from "../api/userApi";
import { createBoardApi } from "../api/boardApi";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const Boards = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi(user._id);
      setBoards(res.data.boards);
    } catch (error) {
      console.error("Boardlarni yuklashda xatolik:", error);
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
      console.error("Board yaratishda xatolik:", error);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4">
        <h3 className="mb-4">Mening boardlarim</h3>

        <form onSubmit={handleCreate} className="d-flex gap-2 mb-4" style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Masalan: Oila rasmlari"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button className="btn btn-dark" type="submit">
            <i className="bi bi-plus-lg me-1"></i> Yaratish
          </button>
        </form>

        {loading ? (
          <Loader />
        ) : boards.length === 0 ? (
          <p className="text-secondary">Hali boardlaringiz yo'q — yuqoridan birinchisini yarating!</p>
        ) : (
          <div className="row g-3">
            {boards.map((board) => (
              <div className="col-6 col-md-4 col-lg-3" key={board._id}>
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
                    {board.pins ? board.pins.length : 0} ta rasm
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Boards;
