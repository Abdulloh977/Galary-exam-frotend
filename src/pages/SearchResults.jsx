import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import SearchBar from "../components/SearchBar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import MasonryGrid from "../components/MasonryGrid";
import Loader from "../components/Loader";
import { useLanguage } from "../context/LanguageContext";
import { searchPinsApi } from "../api/pinApi";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const query = searchParams.get("query") || "";

  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const res = await searchPinsApi(query);
        setPins(res.data.pins);
      } catch (error) {
        console.error("Qidirishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <PageLayout
      topBar={
        <div className="d-flex align-items-center gap-3">
          <SearchBar />
          <LanguageSwitcher />
        </div>
      }
    >
      <h5 className="mb-3">
        {t("search_results_for")} "{query}" {!loading && `(${pins.length})`}
      </h5>

      {loading ? <Loader /> : <MasonryGrid pins={pins} />}
    </PageLayout>
  );
};

export default SearchResults;
