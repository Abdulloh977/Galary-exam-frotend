import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const PageLayout = ({ topBar, children, isSidebarOpen: propsIsSidebarOpen, onToggleSidebar }) => {
  
  // 1. Agar tashqaridan (Home.jsx'dan) boshqaruv kelmasa, o'zining ichki shtatidan foydalanadi
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  // Haqiqiy ishlaydigan holat: tashqaridan kelgan props bo'lsa shuni, bo'lmasa ichki holatni oladi
  const isSidebarOpen = propsIsSidebarOpen !== undefined ? propsIsSidebarOpen : internalSidebarOpen;
  
  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar(); // Tashqaridagi funksiyani ishga tushiradi (Home.jsx)
    } else {
      setInternalSidebarOpen((prev) => !prev); // Ichki holatni o'zgartiradi
    }
  };

  // Ekran o'lchami o'zgarganda avtomatik moslashish mantiqi
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* SIDEBAR REJIMI */}
      <div 
        style={{ 
          display: windowWidth >= 768 ? "block" : (isSidebarOpen ? "block" : "none"), 
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1040 
        }}
      >
        <Sidebar onToggleSidebar={handleToggleSidebar} />
      </div>

      {/* ASOSIY KONTENT */}
      <div 
        style={{ 
          marginLeft: windowWidth >= 768 ? "64px" : (isSidebarOpen ? "64px" : "0px"), 
          minHeight: "100vh",
          transition: "margin-left 0.2s ease" 
        }}
      >
        {topBar && (
          <div
            className="border-bottom bg-white px-4 py-3"
            style={{ position: "sticky", top: 0, zIndex: 15 }}
          >
            {React.isValidElement(topBar)
              ? React.cloneElement(topBar, { isSidebarOpen, onToggleSidebar: handleToggleSidebar })
              : topBar}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </>
  );
};

export default PageLayout;
