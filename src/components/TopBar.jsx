import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";

const TopBar = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <div className="d-flex align-items-center gap-3 w-100">
      
      {/* 💡 YANGILANDI: Pinterest logotipi butunlay olib tashlandi. Faqat tugmaning o'zi qoldi */}
      <div className="d-flex align-items-center flex-shrink-0">
        {/* Uchta chiziqchali (☰) tugma faqat telefonda (d-md-none) va sidebar yopiqligida chiqadi */}
        {!isSidebarOpen && (
          <button 
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm d-md-none"
            style={{ width: "32px", height: "32px" }}
            onClick={onToggleSidebar}
            type="button"
          >
            <i className="bi bi-list fs-5 fw-bold"></i>
          </button>
        )}
      </div>

      {/* Qidiruv satri butun bo'shliqni chiroyli egallaydi */}
      <div className="flex-grow-1">
        <SearchBar />
      </div>
      
      <LanguageSwitcher />
      <AccountMenu />
    </div>
  );
};

export default TopBar;
