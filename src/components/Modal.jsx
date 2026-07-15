const Modal = ({ title, onClose, children }) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 p-4"
        style={{ width: "360px", maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <button className="btn btn-sm border-0" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
