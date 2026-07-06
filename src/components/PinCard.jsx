import { Link } from "react-router-dom";

// Rasm manzili backend'dagi /public papkasidan olinadi
const IMAGE_BASE_URL = "http://localhost:4000/public";

const PinCard = ({ pin }) => {
  return (
    <Link
      to={`/pin/${pin._id}`}
      className="d-block mb-3 text-decoration-none"
      style={{ breakInside: "avoid" }}
    >
      <div className="rounded-4 overflow-hidden position-relative">
        <img
          src={`${IMAGE_BASE_URL}/${pin.imageUrl}`}
          alt={pin.title}
          className="w-100 d-block"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="pt-2">
        <p className="mb-0 text-dark small text-truncate">{pin.title}</p>
      </div>
    </Link>
  );
};

export default PinCard;
