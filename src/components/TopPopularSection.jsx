import { useState, useEffect } from "react";
import PinCard from "./PinCard";
import { useLanguage } from "../context/LanguageContext";

const getColumnCount = (width) => {
  if (width < 576) return 2;
  if (width < 768) return 3;
  if (width < 992) return 4;
  if (width < 1400) return 5;
  return 6;
};

const TopPopularSection = ({ pins }) => {
  const { t } = useLanguage();
  const [columnCount, setColumnCount] = useState(
    typeof window !== "undefined" ? getColumnCount(window.innerWidth) : 6
  );

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!pins || pins.length === 0) return null;

  const topPins = pins.slice(0, 12);
  const columns = Array.from({ length: columnCount }, () => []);
  topPins.forEach((pin, index) => {
    columns[index % columnCount].push(pin);
  });

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-fire text-danger fs-5"></i>
        <h2 className="fs-5 fw-medium mb-0">{t("top_popular")}</h2>
      </div>

      <div className="d-flex align-items-start" style={{ gap: "12px" }}>
        {columns.map((columnPins, colIndex) => (
          <div
            key={colIndex}
            className="d-flex flex-column"
            style={{ gap: "12px", flex: "1 1 0", minWidth: 0 }}
          >
            {columnPins.map((pin) => (
              <PinCard key={pin._id} pin={pin} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPopularSection;
