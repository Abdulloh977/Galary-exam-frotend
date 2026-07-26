import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Fixed overlay — hech qachon sahifadagi boshqa elementlarni surib yubormaydi */}
      <div
        className="position-fixed top-0 start-50 translate-middle-x"
        style={{ zIndex: 2000, marginTop: "16px", pointerEvents: "none" }}
      >
        {toast && (
          <div
            className="toast-pop bg-dark text-white px-3 py-2 rounded-pill shadow d-flex align-items-center gap-2"
            style={{ fontSize: "14px" }}
          >
            <i className="bi bi-check-circle-fill text-success"></i>
            {toast}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};
