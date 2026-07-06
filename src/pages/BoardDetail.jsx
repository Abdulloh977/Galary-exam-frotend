import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import MasonryGrid from "../components/MasonryGrid";
import { getOneBoardApi } from "../api/boardApi";

const BoardDetail = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const res = await getOneBoardApi(id);
        setBoard(res.data.board);
      } catch (error) {
        console.error("Boardni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id]);

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4">
        <Link to="/boards" className="text-decoration-none text-secondary small mb-3 d-inline-block">
          <i className="bi bi-arrow-left me-1"></i> Boardlarga qaytish
        </Link>

        {loading ? (
          <Loader />
        ) : !board ? (
          <p>Board topilmadi</p>
        ) : (
          <>
            <h3 className="mb-4">{board.title}</h3>
            <MasonryGrid pins={board.pins} />
          </>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
