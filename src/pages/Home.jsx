import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; 
import PageLayout from "../components/PageLayout";
import TopBar from "../components/TopBar";
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
  const location = useLocation(); 

  // Agar ekran noutbuk (>= 768px) bo'lsa menyu ochiq (true), telefon bo'lsa yopiq (false) bo'ladi
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); 

        // URL'dan ?interests=nature,cars qiymatlarini ajratib olamiz
        const searchParams = new URLSearchParams(location.search);
        const interests = searchParams.get("interests") || "";

        // API'ga foydalanuvchi tanlagan manfaatlarni ham parametr qilib uzatamiz
        const [allRes, topRes] = await Promise.all([
          getAllPinsApi(interests), 
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
  }, [location.search]); // Foydalanuvchi tavsiyalarni o'zgartirib "Saqlash"ni bossa, useEffect qayta ishlaydi

  return (
    <PageLayout
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      topBar={
        <TopBar 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      }
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Yuqoridagi ommabop bo'lim faqat filtrlanmagan (umumiy) holatda chiqishi uchun tekshiruv */}
          {!new URLSearchParams(location.search).get("interests") && topPins.length > 0 && (
            <TopPopularSection pins={topPins} />
          )}

          <div className="d-flex align-items-center gap-2 mb-3 mt-3">
            <i className="bi bi-grid text-secondary fs-5"></i>
            <h2 className="fs-5 fw-medium mb-0">
              {new URLSearchParams(location.search).get("interests") 
                ? t("filtered_images") || "Tanlangan tavsiyalar" 
                : t("all_images")}
            </h2>
          </div>

          {allPins.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-image fs-1 d-block mb-2"></i>
              <p>Bu kategoriya bo'yicha hozircha hech qanday rasm topilmadi.</p>
            </div>
          ) : (
            <MasonryGrid pins={allPins} />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Home;
