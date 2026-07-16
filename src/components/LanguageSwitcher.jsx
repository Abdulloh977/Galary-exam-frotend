import { useLanguage } from "../context/LanguageContext";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
];

const LanguageSwitcher = () => {
  const { lang, changeLang } = useLanguage();

  return (
    <select
      className="form-select"
      style={{ width: "80px" }}
      value={lang}
      onChange={(e) => changeLang(e.target.value)}
      aria-label="Select language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
