import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";

<<<<<<< HEAD
// Barcha sahifalarda bir xil tartibda: 1) Search 2) Til 3) Profil
const TopBar = () => {
  return (
    <div className="d-flex align-items-center gap-3">
      <SearchBar />
=======
const TopBar = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <div className="d-flex align-items-center gap-3 w-100">
      
      {/* 💡 SHART QO'SHILDI: Logotip va tugma faqat sidebar yopiq bo'lganda (isSidebarOpen false bo'lsa) chiqadi */}
      {!isSidebarOpen && (
        <div className="d-flex align-items-center gap-2 flex-shrink-0 animate-fade-in">
          {/* Pinterest Logotipi */}
          <div className="text-danger d-flex align-items-center" style={{ cursor: "pointer" }}>
            <i className="bi bi-pinterest fs-3"></i>
          </div>
          
          {/* O'ngga qaragan > tugmasi (Menyu yopiqligida ochish uchun) */}
          <button 
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
            style={{ 
              width: "32px", 
              height: "32px"
            }}
            onClick={onToggleSidebar}
            type="button"
          >
            <i className="bi bi-chevron-right fs-6 fw-bold"></i>
          </button>
        </div>
      )}

      {/* Qolgan komponentlar */}
      <div className="flex-grow-1">
        <SearchBar />
      </div>
>>>>>>> 0cab880aa4c979105ddc94ba81b724e84bc716b2
      <LanguageSwitcher />
      <AccountMenu />
    </div>
  );
};

export default TopBar;
