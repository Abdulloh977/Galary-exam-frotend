import React, { useState, useEffect } from 'react';
import useAuth from "../context/AuthContext.jsx";

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // 1. RASMIY GOOGLE IDENTITY SCRIPTINI NAZORAT QILISH
  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      setGoogleReady(true);
      return;
    }

    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!script) {
      script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.onload = () => {
      setGoogleReady(true);
    };

    const timer = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        setGoogleReady(true);
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  // 2. LOGIN SAHIFASIDA GOOGLE TUGMASINI CHIQARISH (REGISTER BILAN BIR XIL QILINDI)
  useEffect(() => {
    if (googleReady && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        // Register sahifangizdagi haqiqiy Client ID qo'yildi:
        client_id: "380649079838-6tutq6rua4vgfikmavshaj0f7u394pd2.apps.googleusercontent.com", 
        callback: async (response) => {
          try {
            setError('');
            setSubmitting(true);
            const result = await loginWithGoogle(response.credential);
            setSubmitting(false);
            
            if (result.success) {
              window.location.href = "/"; 
            } else {
              setError(result.message || "Tizimga kirishda xatolik.");
            }
          } catch (err) {
            setSubmitting(false);
            setError("Google orqali tizimga kirishda xatolik.");
          }
        }
      });

      // Google rasmiy tugmani "googleLoginButton" ID li div ichiga chizadi
      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginButton"),
        { theme: "outline", size: "large", width: "100%", text: "signin_with" }
      );
    }
  }, [googleReady]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(formData); 
    setSubmitting(false);
    
    if (result.success) {
      window.location.href = "/"; 
    } else {
      setError(result.message);
    }
  };

  const handleTwitterLogin = () => {
    alert("Twitter (X) tizimi tez kunda ishga tushadi!");
  };

  return (
    <div className="d-flex align-items-center min-vh-100 py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock text-success" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-2 text-dark fs-4">Xush kelibsiz</h2>
                <p className="text-muted small">Tizimga kirish uchun ma'lumotlarni kiriting</p>
              </div>

              {error && <div className="alert alert-danger small py-2">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ fontSize: "13px" }}>Email manzili</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-envelope"></i></span>
                    <input 
                      type="email" 
                      className="form-control text-dark" 
                      name="email" 
                      placeholder="example@mail.com"
                      value={formData.email} 
                      onChange={handleChange} 
                      style={{ fontSize: "14px", height: "38px" }}
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold" style={{ fontSize: "13px" }}>Parol</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-lock"></i></span>
                    <input 
                      type="password" 
                      className="form-control text-dark" 
                      name="password" 
                      placeholder="******"
                      value={formData.password} 
                      onChange={handleChange} 
                      style={{ fontSize: "14px", height: "38px" }}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-success w-100 fw-semibold py-2 rounded-3" style={{ fontSize: "14px", height: "40px" }}>
                  {submitting ? "Kirilmoqda..." : "Kirish"}
                </button>
              </form>

              <div className="text-center my-4">
                <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                  <div className="w-100 border-top position-absolute" style={{ zIndex: 1 }}></div>
                  <span className="bg-white px-3 text-muted small position-relative" style={{ zIndex: 2 }}>
                    Yoki ijtimoiy tarmoqlar orqali
                  </span>
                </div>

                <div className="d-flex flex-column gap-2 justify-content-center align-items-center w-100">
                  {/* GOOGLE RASMIY TUGMASI UCHUN DIV (TUZATILDI) */}
                  <div id="googleLoginButton" className="w-100 shadow-sm"></div>

                  <button 
                    type="button" 
                    onClick={handleTwitterLogin} 
                    className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3 fw-medium w-100 shadow-sm mt-1"
                    style={{ minHeight: "40px", fontSize: "14px" }}
                  >
                    <i className="bi bi-twitter-x fs-6"></i> Twitter orqali kirish
                  </button>
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="small text-muted mb-0">Hali ro'yxatdan o'tmaganmisiz? <a href="/register" className="text-decoration-none fw-semibold">Yangi hisob ochish</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
