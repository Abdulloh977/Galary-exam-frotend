import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import SearchBar from "../components/SearchBar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import TopPopularSection from "../components/TopPopularSection";
import MasonryGrid from "../components/MasonryGrid";
import Loader from "../components/Loader";
import { useLanguage } from "../context/LanguageContext";
import { getAllPinsApi, getTopPinsApi } from "../api/pinApi";

const Home = () => {
  const { t } = useLanguage();
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
    <PageLayout
      topBar={
        <div className="d-flex align-items-center gap-3">
          <SearchBar />
          <LanguageSwitcher />
        </div>
      }
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <TopPopularSection pins={topPins} />

          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-grid text-secondary fs-5"></i>
            <h2 className="fs-5 fw-medium mb-0">{t("all_images")}</h2>
          </div>

          <MasonryGrid pins={allPins} />
        </>
      )}
    </PageLayout>
  );
};

export default Home;
