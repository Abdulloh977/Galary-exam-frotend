import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import TopPopularSection from "../components/TopPopularSection";
import MasonryGrid from "../components/MasonryGrid";
import Loader from "../components/Loader";
import { getAllPinsApi, getTopPinsApi } from "../api/pinApi";

const Home = () => {
  const [allPins, setAllPins] = useState([]);
  const [topPins, setTopPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, topRes] = await Promise.all([
          getAllPinsApi(),
          getTopPinsApi(),
        ]);
        setAllPins(allRes.data.pins);
        setTopPins(topRes.data.pins);
      } catch (error) {
        console.error("Pinlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="d-flex vh-100 overflow-hidden">
      <div className="flex-shrink-0 h-100">
        <Sidebar />
      </div>

      <div className="flex-grow-1 h-100 overflow-y-auto p-4">
        <div className="d-flex align-items-center mb-4">
          <SearchBar />
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <TopPopularSection pins={topPins} />

            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-grid text-secondary fs-5"></i>
              <h2 className="fs-5 fw-medium mb-0">Barcha rasmlar</h2>
            </div>

            <MasonryGrid pins={allPins} />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
