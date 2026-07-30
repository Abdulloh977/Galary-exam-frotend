import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, googleLoginApi } from "../api/authApi.js"; 

// 1. Kontekstni shu yerda yaratamiz
const AuthContext = createContext(null);

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

  const loginWithGoogleAction = async (googleToken) => {
    try {
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

  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login: loginAction, 
        signup: signupAction, 
        loginWithGoogle: loginWithGoogleAction, 
        logout, 
        updateUser, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 💡 ENG MUHIM JOYI: useAuth hookini bitta fayl ichida default eksport qilib ajratamiz! 
// Bu uslub Vite Fast Refresh (HMR) talablariga 100% javob beradi va hech qanday ogohlantirish bermaydi.
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth faqat AuthProvider ichida ishlatilishi shart!");
  }
  return context;
};

export default useAuth; // Default eksport qilindi
