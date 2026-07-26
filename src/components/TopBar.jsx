import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";

// Barcha sahifalarda bir xil tartibda: 1) Search 2) Til 3) Profil
const TopBar = () => {
  return (
    <div className="d-flex align-items-center gap-3">
      <SearchBar />
      <LanguageSwitcher />
      <AccountMenu />
    </div>
  );
};

export default TopBar;
