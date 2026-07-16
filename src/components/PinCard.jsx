import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

// Rasm manzili backend'dagi /public papkasidan olinadi
const IMAGE_BASE_URL = "http://localhost:4000/public";

const PinCard = ({ pin }) => {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const imageUrl = `${IMAGE_BASE_URL}/${pin.imageUrl}`;
  const pinUrl = `${window.location.origin}/pin/${pin._id}`;

  // "..." menyusi ustiga bosilganda Link'ga o'tib ketmasligi uchun
  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu((v) => !v);
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(pinUrl);
    setShowMenu(false);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: pin.title, url: pinUrl });
    } else {
      navigator.clipboard.writeText(pinUrl);
    }
    setShowMenu(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    // <a download> o'zi ishlaydi, faqat menyuni yopamiz
  };

  return (
    <div className="mb-3 position-relative" style={{ breakInside: "avoid" }}>
      <Link to={`/pin/${pin._id}`} className="d-block text-decoration-none">
        <div className="rounded-4 overflow-hidden position-relative">
          <img
            src={imageUrl}
            alt={pin.title}
            className="w-100 d-block"
            style={{ objectFit: "cover" }}
          />
        </div>
      </Link>

      <div className="pt-2 d-flex align-items-center justify-content-between">
        <Link
          to={`/pin/${pin._id}`}
          className="text-decoration-none text-dark small text-truncate flex-grow-1"
        >
          {pin.title}
        </Link>

        <div className="position-relative flex-shrink-0">
          <button
            className="btn btn-sm border-0 p-0 text-secondary"
            onClick={toggleMenu}
            title="..."
          >
            <i className="bi bi-three-dots"></i>
          </button>

          {showMenu && (
            <>
              {/* Tashqariga bosilganda menyu yopilishi uchun ko'rinmas qatlam */}
              <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ zIndex: 10 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              ></div>

              <div
                className="position-absolute bg-white rounded-3 shadow-sm border py-1"
                style={{ right: 0, top: "20px", width: "180px", zIndex: 11 }}
              >
                <button
                  className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                  onClick={handleCopyLink}
                >
                  <i className="bi bi-link-45deg me-2"></i>
                  {t("copy_link")}
                </button>

                <a
                  href={imageUrl}
                  download
                  className="btn btn-sm w-100 text-start px-3 py-2 border-0 d-block"
                  onClick={handleDownload}
                >
                  <i className="bi bi-download me-2"></i>
                  {t("download")}
                </a>

                <button
                  className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                  onClick={handleShare}
                >
                  <i className="bi bi-share me-2"></i>
                  {t("share")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinCard;
