import PinCard from "./PinCard";
import { useLanguage } from "../context/LanguageContext";

const TopPopularSection = ({ pins }) => {
  const { t } = useLanguage();
  if (!pins || pins.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-fire text-danger fs-5"></i>
        <h2 className="fs-5 fw-medium mb-0">{t("top_popular")}</h2>
      </div>

      <div className="row g-3">
        {pins.slice(0, 10).map((pin) => (
          <div key={pin._id} className="col-6 col-md-4 col-lg-2">
            <PinCard pin={pin} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPopularSection;
