import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { downloadImage } from "../utils/download";
import ShareMenu from "./ShareMenu";

// Rasm manzili backend'dagi /public papkasidan olinadi
const IMAGE_BASE_URL = "http://localhost:4000/public";

<<<<<<< HEAD
const PinCard = ({ pin, showDeleteButton, onDeleteClick }) => {
=======
const PinCard = ({ pin, showDeleteButton, onDeleteClick, onTogglePrivacy }) => {
>>>>>>> 0cab880aa4c979105ddc94ba81b724e84bc716b2
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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
    showToast(t("link_copied"));
    setShowMenu(false);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowShareMenu(true);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    downloadImage(imageUrl, pin.imageUrl || `${pin.title || "pin"}.jpg`);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    onDeleteClick(pin._id);
<<<<<<< HEAD
=======
  };

  // CHECKBOX BOSILGANDA ISHLAYDIGAN EVENT
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Sahifaga o'tib ketmasligi uchun
    if (onTogglePrivacy) {
      onTogglePrivacy(pin._id, e.target.checked);
    }
>>>>>>> 0cab880aa4c979105ddc94ba81b724e84bc716b2
  };

  return (
    <div
      className="position-relative"
      style={{ position: "relative", zIndex: showMenu || showShareMenu ? 1000 : "auto" }}
    >
      <Link to={`/pin/${pin._id}`} className="d-block text-decoration-none">
        <div className="rounded-4 overflow-hidden position-relative pin-image-wrap">
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

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <span className="d-flex align-items-center gap-1 text-secondary small" title={t("views")}>
            <i className="bi bi-eye"></i>
            {pin.views || 0}
          </span>
          <span className="d-flex align-items-center gap-1 text-secondary small" title={t("likes")}>
            <i className="bi bi-heart"></i>
<<<<<<< HEAD
            {pin.likes ? pin.likes.length : 0}
          </span>

          <div className="position-relative">
          <button
            className="btn btn-sm border-0 p-0 text-secondary"
            onClick={toggleMenu}
            title="..."
          >
            <i className="bi bi-three-dots"></i>
          </button>
=======
            {pin.likesCount ?? (pin.likes ? pin.likes.length : 0)}
          </span>
>>>>>>> 0cab880aa4c979105ddc94ba81b724e84bc716b2

          <div className="position-relative">
            <button
              className="btn btn-sm border-0 p-0 text-secondary"
              onClick={toggleMenu}
              title="..."
            >
              <i className="bi bi-three-dots"></i>
            </button>

            {showMenu && (
              <>
                {/* Tashqariga bosilganda yopilishi uchun */}
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
                  style={{ right: 0, top: "20px", width: "200px", zIndex: 11 }}
                >
                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                    onClick={handleCopyLink}
                  >
                    <i className="bi bi-link-45deg me-2"></i>
                    {t("copy_link")}
                  </button>

<<<<<<< HEAD
                <button
                  className="btn btn-sm w-100 text-start px-3 py-2 border-0 d-block"
                  onClick={handleDownload}
                >
                  <i className="bi bi-download me-2"></i>
                  {t("download")}
                </button>

                <button
                  className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                  onClick={handleShare}
                >
                  <i className="bi bi-share me-2"></i>
                  {t("share")}
                </button>

                {showDeleteButton && (
                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0 text-danger"
                    onClick={handleDeleteClick}
                  >
                    <i className="bi bi-trash3 me-2"></i>
                    {t("delete")}
                  </button>
                )}
              </div>
            </>
          )}

          {showShareMenu && (
            <ShareMenu
              url={pinUrl}
              title={pin.title}
              onClose={() => setShowShareMenu(false)}
              style={{ right: 0, top: "20px" }}
            />
          )}
=======
                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0 d-block"
                    onClick={handleDownload}
                  >
                    <i className="bi bi-download me-2"></i>
                    {t("download")}
                  </button>

                  <button
                    className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                    onClick={handleShare}
                  >
                    <i className="bi bi-share me-2"></i>
                    {t("share")}
                  </button>

                  {/* ASOSIY LENTADAN YASHIRISH CHECKBOX'I - FAQAT PROFIL EGASIGA CHIQADI */}
                  {showDeleteButton && (
                    <>
                      <hr className="my-1 text-black-50" />
                      <div 
                        className="px-3 py-2 d-flex align-items-center gap-2"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <input
                          className="form-check-input m-0"
                          type="checkbox"
                          id={`hide-home-${pin._id}`}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          checked={pin.isPrivate || false}
                          onChange={handleCheckboxChange}
                        />
                        <label 
                          className="form-check-label small user-select-none text-dark mb-0" 
                          htmlFor={`hide-home-${pin._id}`}
                          style={{ cursor: "pointer", fontSize: "12px" }}
                        >
                          Lentadan yashirish
                        </label>
                      </div>
                    </>
                  )}

                  {showDeleteButton && (
                    <>
                      <hr className="my-1 text-black-50" />
                      <button
                        className="btn btn-sm w-100 text-start px-3 py-2 border-0 text-danger"
                        onClick={handleDeleteClick}
                      >
                        <i className="bi bi-trash3 me-2"></i>
                        {t("delete")}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {showShareMenu && (
              <ShareMenu
                url={pinUrl}
                title={pin.title}
                onClose={() => setShowShareMenu(false)}
                style={{ right: 0, top: "20px" }}
              />
            )}
>>>>>>> 0cab880aa4c979105ddc94ba81b724e84bc716b2
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinCard;
