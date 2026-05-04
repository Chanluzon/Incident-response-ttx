import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./toast/toast";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { apiUrl } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import PageBackground from "../../components/PageBackground";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // password checklist
    if (name === "password") {
      setPasswordChecks({
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /\d/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    // Validations
    if (!name.trim()) return showToast("Name is required.", "error");
    if (name.length < 2)
      return showToast("Name must be at least 2 characters long.", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return showToast("Email is required.", "error");
    if (!emailRegex.test(email))
      return showToast("Please enter a valid email address.", "error");

    if (
      !passwordChecks.length ||
      !passwordChecks.upper ||
      !passwordChecks.lower ||
      !passwordChecks.number
    ) {
      showToast("Password does not meet the requirements.", "error");
      return;
    }

    if (password !== confirmPassword)
      return showToast("Passwords do not match!", "error");

    try {
      const response = await fetch(apiUrl("/api/moderator/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      showToast("Registration successful!", "success");

      setTimeout(() => {
        navigate("/moderator");
      }, 700);
    } catch (err) {
      console.error("Error:", err);
      showToast(err.message, "error");
    }
  };

  const handleLogin = () => navigate("/moderator");

  return (
    <PageBackground>
      <div className={`relative z-10 w-full h-full flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-1000 ${isLightMode ? 'bg-white/30' : 'bg-white/5'}`}>
        <div className={`backdrop-blur-2xl border p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-[480px] transition-colors duration-1000 ${isLightMode ? 'bg-white/60 border-white/40' : 'bg-slate-900/60 border-white/10'}`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors duration-1000 ${isLightMode ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
              <ShieldCheck className="text-blue-500 w-10 h-10" />
            </div>
            <h1 className={`text-3xl font-black tracking-tight mb-2 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
              Join the TTX
            </h1>
            <p className={`text-sm font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
              Create a moderator account to manage simulations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative group">
              <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-2 transition-colors group-focus-within:text-blue-500 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isLightMode ? 'text-slate-400' : 'text-white/20'}`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Moderator Name"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all font-medium ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}`}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-2 transition-colors group-focus-within:text-blue-500 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isLightMode ? 'text-slate-400' : 'text-white/20'}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all font-medium ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}`}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative group">
              <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-2 transition-colors group-focus-within:text-blue-500 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isLightMode ? 'text-slate-400' : 'text-white/20'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all font-medium ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-blue-500 ${isLightMode ? 'text-slate-400' : 'text-white/20'}`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Checklist */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.length ? 'text-blue-500' : (isLightMode ? 'text-slate-400' : 'text-white/20')}`}>
                  <div className={`w-1 h-1 rounded-full ${passwordChecks.length ? 'bg-blue-500' : (isLightMode ? 'bg-slate-300' : 'bg-white/10')}`} />
                  8+ Characters
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.upper ? 'text-blue-500' : (isLightMode ? 'text-slate-400' : 'text-white/20')}`}>
                  <div className={`w-1 h-1 rounded-full ${passwordChecks.upper ? 'bg-blue-500' : (isLightMode ? 'bg-slate-300' : 'bg-white/10')}`} />
                  Uppercase
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.lower ? 'text-blue-500' : (isLightMode ? 'text-slate-400' : 'text-white/20')}`}>
                  <div className={`w-1 h-1 rounded-full ${passwordChecks.lower ? 'bg-blue-500' : (isLightMode ? 'bg-slate-300' : 'bg-white/10')}`} />
                  Lowercase
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${passwordChecks.number ? 'text-blue-500' : (isLightMode ? 'text-slate-400' : 'text-white/20')}`}>
                  <div className={`w-1 h-1 rounded-full ${passwordChecks.number ? 'bg-blue-500' : (isLightMode ? 'bg-slate-300' : 'bg-white/10')}`} />
                  Number
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <label className={`block text-xs font-bold uppercase tracking-widest pl-1 mb-2 transition-colors group-focus-within:text-blue-500 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isLightMode ? 'text-slate-400' : 'text-white/20'}`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all font-medium ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-blue-500 ${isLightMode ? 'text-slate-400' : 'text-white/20'}`}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              CREATE ACCOUNT
            </button>
          </form>

          <div className={`text-center mt-8 text-sm font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
            Already have an account?{" "}
            <button
              onClick={handleLogin}
              className="text-blue-500 hover:text-blue-400 font-bold hover:underline transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} />
    </PageBackground>
  );
}

