import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; 

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false); // Google tayyorligini tekshirish statisi

  // SKRIPTNI MAJBURIY VA ASINXRON YUKLASH TIZIMI
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        setGoogleReady(true);
        return;
      }

      // Agar skript html ichida bo'lmasa, uni yaratamiz
      let script = document.querySelector('script[src="https://google.com"]');
      if (!script) {
        script = document.createElement('script');
        script.src = "https://google.com";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.onload = () => {
        setGoogleReady(true);
      };
    };

    loadGoogleScript();

    // Har ehtimolga qarshi, 500 millisoniyadan keyin qayta tekshirib qo'yish
    const timer = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        setGoogleReady(true);
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

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

  const handleGoogleLogin = () => {
    // Agar skript tayyor bo'lsa yoki window ichida aniqlansa ishga tushadi
    if (googleReady || (window.google && window.google.accounts && window.google.accounts.id)) {
      window.google.accounts.id.initialize({
        // DIQQAT: Bu yerga Register sahifasida ishlatgan o'sha haqiqiy Client ID'ni qo'ying!
        client_id: "://googleusercontent.com", 
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
            setError("Google login tizimida kutilmagan xatolik.");
          }
        }
      });

      window.google.accounts.id.prompt();
    } else {
      setError("Google tizimi yuklanmoqda, iltimos 2 soniya kutib qayta bosing.");
    }
  };

  const handleTwitterLogin = () => {
    alert("Twitter (X) tizimi tez kunda ishga tushadi!");
  };

  return (
    <div className="d-flex align-items-center min-vh-100 py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-10 col-sm-8 col-md-6 col-lg-4">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock text-success" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-2 text-dark">Xush kelibsiz</h2>
                <p className="text-muted small">Tizimga kirish uchun ma'lumotlarni kiriting</p>
              </div>

              {error && <div className="alert alert-danger small py-2">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email manzili</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-envelope"></i></span>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Parol</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted"><i className="bi bi-lock"></i></span>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-success w-100 fw-semibold py-2 rounded-3">
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

                <div className="d-flex gap-2 justify-content-center">
                  <button type="button" onClick={handleGoogleLogin} className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3 fw-semibold w-50 small shadow-sm">
                    <i className="bi bi-google fs-5"></i> Google
                  </button>
                  <button type="button" onClick={handleTwitterLogin} className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3 fw-semibold w-50 small shadow-sm">
                    <i className="bi bi-twitter-x fs-5"></i> Twitter
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
