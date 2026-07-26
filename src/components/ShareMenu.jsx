import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

// Rasmni turli platformalarga jo'natish uchun chiroyli, o'zimizga tegishli menyu.
// Brauzerning standart (chiroyсиз) "Share" oynasi o'rniga ishlatiladi.
const ShareMenu = ({ url, title, onClose, style, className = "" }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "");

  const destinations = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: "bi-whatsapp",
      color: "#25D366",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: "bi-telegram",
      color: "#26A5E4",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: "bi-facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "twitter",
      label: "X (Twitter)",
      icon: "bi-twitter-x",
      color: "#000000",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "bi-linkedin",
      color: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      key: "email",
      label: "Email",
      icon: "bi-envelope-fill",
      color: "#6c757d",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  const handleOpen = (e, href) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=600");
    onClose();
  };

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    showToast(t("link_copied"));
    onClose();
  };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ zIndex: 1049 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      ></div>

      <div
        className={`position-absolute bg-white rounded-4 shadow border p-3 share-menu ${className}`}
        style={{ width: "260px", zIndex: 1050, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="small fw-medium text-secondary mb-2">{t("share_via")}</p>

        <div className="d-flex flex-wrap gap-3 mb-2">
          {destinations.map((dest) => (
            <button
              key={dest.key}
              className="btn p-0 border-0 d-flex flex-column align-items-center share-dest-btn"
              style={{ width: "64px" }}
              onClick={(e) => handleOpen(e, dest.href)}
              title={dest.label}
            >
              <span
                className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                style={{ width: "44px", height: "44px", backgroundColor: dest.color, color: "#fff", fontSize: "20px" }}
              >
                <i className={`bi ${dest.icon}`}></i>
              </span>
              <span className="text-truncate w-100 text-center" style={{ fontSize: "11px" }}>
                {dest.label}
              </span>
            </button>
          ))}
        </div>

        <hr className="my-2" />

        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleCopy}
        >
          <i className="bi bi-link-45deg"></i>
          {t("copy_link")}
        </button>
      </div>
    </>
  );
};

export default ShareMenu;
