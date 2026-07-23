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

// Haqiqiy ustunli (flex) masonry — CSS "columns" xususiyati ishlatilmaydi.
// CSS multi-column'da har bir ustun alohida "clip" konteksti hosil qilib,
// kartaning "..." menyusi qo'shni ustun chegarasida kesilib/yashirinib qolishi
// mumkin edi. Endi har bir ustun — oddiy flex konteyner, shuning uchun
// dropdown menyular hech qanday qo'shni elementga xalaqit bermaydi.
const MasonryGrid = ({ pins, showDeleteButton, onDeleteClick }) => {
  const { t } = useLanguage();
  const [columnCount, setColumnCount] = useState(
    typeof window !== "undefined" ? getColumnCount(window.innerWidth) : 5
  );

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!pins || pins.length === 0) {
    return <p className="text-secondary text-center py-4">{t("no_images_yet")}</p>;
  }

  const columns = Array.from({ length: columnCount }, () => []);
  pins.forEach((pin, index) => {
    columns[index % columnCount].push(pin);
  });

  return (
    <div className="d-flex align-items-start" style={{ gap: "12px" }}>
      {columns.map((columnPins, colIndex) => (
        <div
          key={colIndex}
          className="d-flex flex-column"
          style={{ gap: "12px", flex: "1 1 0", minWidth: 0 }}
        >
          {columnPins.map((pin) => (
            <PinCard
              key={pin._id}
              pin={pin}
              showDeleteButton={showDeleteButton}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
