import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { updateProfileApi } from "../api/userApi";

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState(user?.firstname || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(
    user?.profilePicture ? `http://localhost:4000/public/${user.profilePicture}` : null
  );
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("username", username);
    formData.append("email", email);
    if (avatar) formData.append("profilePicture", avatar);

    try {
      setLoading(true);
      const res = await updateProfileApi(user._id, formData);
      // localStorage'dagi foydalanuvchi ma'lumotini yangilaymiz (token o'zgarmaydi)
      const token = localStorage.getItem("token");
      login(res.data.user, token);
      navigate(`/profile/${user._id}`);
    } catch (error) {
      console.error("Profilni yangilashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4 d-flex justify-content-center">
        <div style={{ maxWidth: "500px", width: "100%" }}>
          <h4 className="mb-4">Profilni tahrirlash</h4>

          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <label htmlFor="avatarInput" style={{ cursor: "pointer" }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: "96px", height: "96px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mx-auto"
                    style={{ width: "96px", height: "96px", fontSize: "32px" }}
                  >
                    {firstname ? firstname[0].toUpperCase() : "U"}
                  </div>
                )}
                <p className="small text-secondary mt-2 mb-0">Rasmni o'zgartirish</p>
              </label>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                className="d-none"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ism</label>
              <input
                type="text"
                className="form-control"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Familiya</label>
              <input
                type="text"
                className="form-control"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="btn btn-danger rounded-pill px-4" type="submit" disabled={loading}>
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
