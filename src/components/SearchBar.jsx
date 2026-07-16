import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SearchBar = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-grow-1">
      <div
        className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2"
        style={{ maxWidth: "500px" }}
      >
        <i className="bi bi-search text-secondary"></i>
        <input
          type="text"
          className="form-control border-0 bg-transparent shadow-none p-0"
          placeholder={t("search_placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </form>
  );
};

export default SearchBar;
