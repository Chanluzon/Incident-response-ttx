import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./toast/toast";
import { apiUrl } from "../../config/api";
import { Eye, EyeOff, ShieldCheck, Lock, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import PageBackground from "../../components/PageBackground";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/moderator/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("moderator", JSON.stringify(data.moderator));

      showToast("Login successful!", "success");

      setTimeout(() => {
        navigate("/moderator/dashboard");
      }, 700);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <div className="flex h-full w-full">
        {/* Left Side - Brand Identity */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative z-10">
          <div className="relative group">
            <div className={`absolute -inset-1 rounded-full blur-2xl transition-all duration-500 opacity-30 group-hover:opacity-50 ${isLightMode ? 'bg-blue-400' : 'bg-blue-500'}`} />
            <img
              src="/wislogo.svg"
              alt="WIS Logo"
              className={`relative max-w-[380px] w-full drop-shadow-2xl select-none transition-all duration-500 group-hover:scale-105 ${isLightMode ? 'brightness-0 opacity-90' : ''}`}
            />
          </div>
          <div className="mt-12 text-center">
            <h2 className={`text-4xl font-black tracking-tighter mb-2 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
              MODERATOR <span className="text-blue-500">PORTAL</span>
            </h2>
            <p className={`text-lg font-medium tracking-widest uppercase transition-colors duration-1000 ${isLightMode ? 'text-slate-600/80' : 'text-white/40'}`}>

            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-1 items-center justify-center p-6 relative z-10">
          <div className={`w-full max-w-[450px] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl border transition-all duration-1000 ${isLightMode
            ? 'bg-white/80 border-white/50 shadow-slate-200/50'
            : 'bg-slate-900/60 border-white/10 shadow-black/50'
            }`}>

            <div className="mb-10 text-center lg:hidden">
              <img src="/wislogo.svg" alt="WIS Logo" className={`h-12 mx-auto mb-4 ${isLightMode ? 'brightness-0 opacity-80' : ''}`} />
              <h1 className={`text-2xl font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Moderator Login</h1>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest ml-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Administrator Email
                </label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isLightMode ? 'text-slate-400 group-focus-within:text-blue-500' : 'text-slate-500 group-focus-within:text-blue-400'}`}>
                    <User size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all duration-300 ${isLightMode
                      ? 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:bg-white text-slate-800'
                      : 'bg-slate-800/50 border-white/5 focus:border-blue-500 focus:bg-slate-800 text-white'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-widest ml-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Password
                </label>

                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isLightMode ? 'text-slate-400 group-focus-within:text-blue-500' : 'text-slate-500 group-focus-within:text-blue-400'}`}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl border outline-none transition-all duration-300 ${isLightMode
                      ? 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:bg-white text-slate-800'
                      : 'bg-slate-800/50 border-white/5 focus:border-blue-500 focus:bg-slate-800 text-white'
                      }`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-300 ${isLightMode ? 'text-slate-400 hover:text-slate-600' : 'text-slate-50/40 hover:text-white'}`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full h-[60px] overflow-hidden rounded-2xl
                    text-white font-black tracking-[0.2em] uppercase
                    flex items-center justify-center gap-3
                    transition-all duration-500 hover:scale-[1.02] active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLightMode
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)]'
                      : 'bg-blue-500 hover:bg-blue-400 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)]'}
                  `}
                >
                  {/* Tech scanning line inside button */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer`} />

                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Log in</span>
                      <ShieldCheck size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className={`text-xs font-medium tracking-tight ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Restricted Area • Unauthorized Access Prohibited
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toast toasts={toasts} />
    </PageBackground>
  );
}


