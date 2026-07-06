import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh" }}>
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <p className="text-secondary mb-3">Sahifa topilmadi</p>
      <Link to="/" className="btn btn-dark rounded-pill">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
};

export default NotFound;
