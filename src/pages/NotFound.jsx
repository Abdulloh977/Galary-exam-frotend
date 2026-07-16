import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh" }}>
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <p className="text-secondary mb-3">{t("page_not_found")}</p>
      <Link to="/" className="btn btn-dark rounded-pill">
        {t("back_to_home")}
      </Link>
    </div>
  );
};

export default NotFound;