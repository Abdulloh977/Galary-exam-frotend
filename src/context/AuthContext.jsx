import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, googleLoginApi } from "../api/authApi.js"; // api faylingiz yo'li
import axiosInstance from "../api/axiosInstance.js"; // axiosInstance yo'li

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginAction = async (credentials) => {
    try {
      const response = await loginApi(credentials);
      const { user, token } = response.data; 
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Tizimga kirishda xatolik";
      return { success: false, message: errorMsg };
    }
  };

  const signupAction = async (userData) => {
    try {
      const response = await signupApi(userData);
      const { user, token } = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Ro'yxatdan o'tishda xatolik";
      return { success: false, message: errorMsg };
    }
  };

  // AuthProvider ichidagi funksiya:
    const loginWithGoogleAction = async (googleToken) => {
      try {
        // Endi to'g'ridan-to'g'ri tayyor API funksiyamizni chaqiramiz
        const response = await googleLoginApi({ token: googleToken });
        const { user, token } = response.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        setUser(user);
        return { success: true };
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Google orqali kirishda xatolik";
        return { success: false, message: errorMsg };
      }
    };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: loginAction, signup: signupAction, loginWithGoogle: loginWithGoogleAction, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
