import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom"; // 💡 YANGI QO'SHILDI: Menyuni bodyga chiqarish uchun
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { downloadImage } from "../utils/download";
import ShareMenu from "./ShareMenu";

const IMAGE_BASE_URL = "http://localhost:4000/public";

const PinCard = ({ pin, showDeleteButton, onDeleteClick, onTogglePrivacy }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // 💡 YANGI QO'SHILDI: Tugmaning ekrandagi aniq o'rnini (koordinatasini) aniqlash uchun ref
  const buttonRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });

  const currentImage = pin.image || pin.imageUrl || "";
  const imageUrl = `${IMAGE_BASE_URL}/${currentImage}`;
  const pinUrl = `${window.location.origin}/pin/${pin._id}`;

  // 💡 YANGI QO'SHILDI: Uchta nuqta bosilganda uning ekrandagi o'rnini hisoblab, menyuni shundoq tagiga joylashtirish
  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + window.scrollY + 5, // Tugmaning tagidan 5px pastda
        left: rect.left + window.scrollX - 160 // Chapga surib, formaga tekislash
      });
    }
    setShowMenu((v) => !v);
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(pinUrl);
    showToast(t("link_copied") || "Havola nusxalandi!");
    setShowMenu(false);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    if (navigator.share) {
      try {
        await navigator.share({
          title: pin.title || "Pinterest Pin",
          url: pinUrl,
        });
      } catch (err) {
        console.log("Native share bekor qilindi:", err);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    downloadImage(imageUrl, currentImage || `${pin.title || "pin"}.jpg`);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (onDeleteClick) onDeleteClick(pin._id);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onTogglePrivacy) {
      onTogglePrivacy(pin._id, e.target.checked);
    }
  };

  return (
    <div className="position-relative">
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
            {pin.likesCount ?? (pin.likes ? pin.likes.length : 0)}
          </span>

          <div className="position-relative">
            {/* 💡 TUZATILDI: ref biriktirildi */}
            <button
              ref={buttonRef}
              className="btn btn-sm border-0 p-0 text-secondary"
              onClick={toggleMenu}
              type="button"
            >
              <i className="bi bi-three-dots fs-5"></i>
            </button>

            {/* 💡 YANGILANDI: createPortal orqali kichik menyuni rasm cheklovlaridan chiqarib, body'ga otamiz */}
            {showMenu && createPortal(
              <>
                {/* Global orqa fon (Menyudan tashqari bosilganda yopilishi uchun) */}
                <div
                  className="position-fixed top-0 start-0 w-100 h-100"
                  style={{ zIndex: 9998, background: "transparent" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                ></div>

                {/* Haqiqiy erkin harakatlanuvchi absolute quti */}
                <div
                  className="position-absolute bg-white rounded-3 shadow border py-1"
                  style={{ 
                    top: `${menuCoords.top}px`, 
                    left: `${menuCoords.left}px`, 
                    width: "190px", 
                    zIndex: 9999 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="btn btn-sm w-100 text-start px-3 py-2 border-0" onClick={handleCopyLink}>
                    <i className="bi bi-link-45deg me-2"></i> {t("copy_link")}
                  </button>

                  <button className="btn btn-sm w-100 text-start px-3 py-2 border-0" onClick={handleDownload}>
                    <i className="bi bi-download me-2"></i> {t("download")}
                  </button>

                  <button className="btn btn-sm w-100 text-start px-3 py-2 border-0" onClick={handleShare}>
                    <i className="bi bi-share me-2"></i> {t("share")}
                  </button>

                  {showDeleteButton && (
                    <>
                      <hr className="my-1 text-black-50" />
                      <div className="px-3 py-2 d-flex align-items-center gap-2">
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
                      <button className="btn btn-sm w-100 text-start px-3 py-2 border-0 text-danger" onClick={handleDeleteClick}>
                        <i className="bi bi-trash3 me-2"></i> {t("delete")}
                      </button>
                    </>
                  )}
                </div>
              </>,
              document.body
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinCard;
