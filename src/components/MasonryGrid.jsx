import PinCard from "./PinCard";

// CSS "columns" xususiyati orqali haqiqiy masonry (turli balandlikdagi) grid hosil qilinadi
const MasonryGrid = ({ pins }) => {
  if (!pins || pins.length === 0) {
    return <p className="text-secondary text-center py-4">Hozircha rasmlar yo'q</p>;
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
