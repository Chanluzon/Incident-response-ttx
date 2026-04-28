import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authBg from "../../images/auth-background.png";
import Toast from "./toast/toast";
import { apiUrl } from "../../config/api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
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
    <div className="relative flex h-screen w-screen bg-cover bg-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 z-0"
        style={{ backgroundImage: `url(${authBg})` }}
      ></div>

      {/* Left Side */}
      <div className="flex flex-1 items-center justify-start pl-28 relative z-10">
        <img
          src="/wislogo.svg"
          alt="WIS Logo"
          className="max-w-[420px] w-full drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] select-none"
        />
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center relative z-10">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-[400px] text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded-md border border-gray-300 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 pr-12 rounded-md border border-gray-300 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />

                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* Login Button */}
            <div className="w-full flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="min-w-[160px] bg-[green] hover:bg-[#55AA55] active:bg-[#1EB46E] text-white font-bold text-lg py-3 rounded-full shadow-[0_4px_12px_rgba(46,229,138,0.4)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#2EE58A]/50"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
