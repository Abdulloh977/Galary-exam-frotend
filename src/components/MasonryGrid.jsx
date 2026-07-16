import PinCard from "./PinCard";
import { useLanguage } from "../context/LanguageContext";

// CSS "columns" xususiyati orqali haqiqiy masonry (turli balandlikdagi) grid hosil qilinadi
const MasonryGrid = ({ pins }) => {
  const { t } = useLanguage();

  if (!pins || pins.length === 0) {
    return <p className="text-secondary text-center py-4">{t("no_images_yet")}</p>;
  }

  return (
    <div
      style={{
        columnCount: 5,
        columnGap: "12px",
      }}
    >
      {pins.map((pin) => (
        <div key={pin._id} style={{ breakInside: "avoid" }}>
          <PinCard pin={pin} />
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
