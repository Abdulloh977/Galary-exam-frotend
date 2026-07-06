import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { createPinApi } from "../api/pinApi";

const CreatePin = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !image) {
      setError("Sarlavha va rasm kiritilishi shart!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("image", image);

    try {
      setLoading(true);
      const res = await createPinApi(formData);
      navigate(`/pin/${res.data.pin._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4 d-flex justify-content-center">
        <div className="row g-4" style={{ maxWidth: "700px", width: "100%" }}>
          <h4 className="mb-3">Yangi pin yaratish</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="col-md-5">
            <label
              htmlFor="imageInput"
              className="d-flex align-items-center justify-content-center rounded-4 bg-light"
              style={{ height: "280px", cursor: "pointer", overflow: "hidden" }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="text-center text-secondary">
                  <i className="bi bi-cloud-upload fs-1"></i>
                  <p className="mb-0 small">Rasm tanlash uchun bosing</p>
                </div>
              )}
            </label>
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              className="d-none"
              onChange={handleImageChange}
            />
          </div>

          <div className="col-md-7">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Sarlavha</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Rasm nomi"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Tavsif</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rasm haqida qisqacha"
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Teglar (vergul bilan ajrating)</label>
                <input
                  type="text"
                  className="form-control"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tabiat, manzara, quyosh"
                />
              </div>

              <button
                className="btn btn-danger rounded-pill px-4"
                type="submit"
                disabled={loading}
              >
                {loading ? "Yuklanmoqda..." : "Joylash"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
