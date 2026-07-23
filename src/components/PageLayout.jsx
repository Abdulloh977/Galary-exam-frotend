import Sidebar from "./Sidebar";

// 1. BU YERDA: onToggleSidebar props qilib qabul qilindi
const PageLayout = ({ topBar, children, isSidebarOpen, onToggleSidebar }) => {
  return (
    <>
      {/* 1. Sidebar ochiq yoki yopiqligiga qarab uni yashiramiz yoki ko'rsatamiz */}
      <div 
        style={{ 
          display: isSidebarOpen ? "block" : "none", 
          position: "fixed",
          zIndex: 20
        }}
      >
        {/* 2. BU YERDA: Sidebar'ga funksiya ulab yuborildi */}
        <Sidebar onToggleSidebar={onToggleSidebar} />
      </div>

      {/* 2. Asosiy kontent: Sidebar holatiga qarab chap tarafdan joy tashlaydi */}
      <div 
        style={{ 
          marginLeft: isSidebarOpen ? "64px" : "0px", 
          minHeight: "100vh",
          transition: "margin-left 0.2s ease" 
        }}
      >
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
