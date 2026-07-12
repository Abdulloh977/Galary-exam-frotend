import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; 

function Register() {
  const { signup, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ 
    username: '', 
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '' 
  });
  
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

  // 2. REGISTER SAHIFASIDA GOOGLE TUGMASINI CHIQARISH
  useEffect(() => {
    if (googleReady && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        // O'zingizning haqiqiy Google Client ID kodingiz qo'yildi:
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
              setError(result.message);
            }
          } catch (err) {
            setSubmitting(false);
            setError("Google orqali ro'yxatdan o'tishda xatolik.");
          }
        }
      });

      // Google o'zining rasmiy tugmasini shu div ichiga joylaydi
      window.google.accounts.id.renderButton(
        document.getElementById("googleRegisterButton"),
        { theme: "outline", size: "large", width: "100%", text: "signup_with" }
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

    const result = await signup(formData); 
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
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              
              <div className="text-center mb-4">
                <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-2 text-dark">Hisob yaratish</h2>
                <p className="text-muted small">Loyiha platformasiga xush kelibsiz</p>
              </div>

              {error && <div className="alert alert-danger small py-2">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold">Ismingiz</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted"><i className="bi bi-person"></i></span>
                      <input type="text" className="form-control" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="John" required />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold">Familiyangiz</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted"><i className="bi bi-person"></i></span>
                      <input type="text" className="form-control" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Doe" required />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Foydalanuvchi nomi</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-at"></i></span>
                    <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe12" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email manzili</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-envelope"></i></span>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Parol</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-lock"></i></span>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary w-100 fw-semibold py-2 rounded-3 mt-2">
                  {submitting ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
                </button>
              </form>

              <div className="text-center my-4">
                <div className="position-relative d-flex align-items-center justify-content-center mb-3">
                  <div className="w-100 border-top position-absolute" style={{ zIndex: 1 }}></div>
                  <span className="bg-white px-3 text-muted small position-relative" style={{ zIndex: 2 }}>
                    Yoki ijtimoiy tarmoqlar orqali
                  </span>
                </div>

                <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                  {/* GOOGLE RASMIY TUGMASI DIVI */}
                  <div id="googleRegisterButton" className="w-100 shadow-sm"></div>

                  <button type="button" onClick={handleTwitterLogin} className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3 fw-semibold w-100 small shadow-sm mt-1">
                    <i className="bi bi-twitter-x fs-5"></i> Twitter orqali ro'yxatdan o'tish
                  </button>
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="small text-muted mb-0">Profilingiz bormi? <a href="/login" className="text-decoration-none fw-semibold">Tizimga kirish</a></p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
