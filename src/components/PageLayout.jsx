import Sidebar from "./Sidebar";

// Barcha sahifalarda Sidebar butunlay qotib turadi (position: fixed)
// topBar berilsa, u ham skroll paytida yuqorida qotib qoladi (position: sticky)
const PageLayout = ({ topBar, children }) => {
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: "64px", minHeight: "100vh" }}>
        {topBar && (
          <div
            className="border-bottom bg-white px-4 py-3"
            style={{ position: "sticky", top: 0, zIndex: 15 }}
          >
            {topBar}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </>
  );
};

export default PageLayout;
