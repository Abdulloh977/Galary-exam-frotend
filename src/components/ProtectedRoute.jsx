import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Bu komponent himoyalangan sahifalarni o'rab turadi.
// Agar foydalanuvchi login qilmagan bo'lsa — avtomatik /login sahifasiga o'tkazadi.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // hali tekshirilyapti, hech narsa ko'rsatmaymiz

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
