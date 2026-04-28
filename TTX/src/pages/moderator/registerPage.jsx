import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authBg from "../../images/auth-background.png";
import Toast from "./toast/toast";
import { Eye, EyeOff } from "lucide-react";
import { apiUrl } from "../../config/api";

export default function RegisterPage() {
  const navigate = useNavigate();
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
    // name
    if (!name.trim()) return showToast("Name is required.", "error");
    if (name.length < 2)
      return showToast("Name must be at least 2 characters long.", "error");

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return showToast("Email is required.", "error");
    if (!emailRegex.test(email))
      return showToast("Please enter a valid email address.", "error");

    // password
    if (
      !passwordChecks.length ||
      !passwordChecks.upper ||
      !passwordChecks.lower ||
      !passwordChecks.number
    ) {
      showToast("Password does not meet the requirements.", "error");
      return;
    }

    // confirm password
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
    <div className="relative flex h-screen w-screen bg-cover bg-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
        style={{ backgroundImage: `url(${authBg})` }}
      ></div>

      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white bg-opacity-60 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-[450px] text-left">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full px-3 py-3 rounded-md border border-gray-300 text-green-800 text-left focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-3 py-3 rounded-md border border-gray-300 text-green-800 text-left focus:outline-none focus:ring-2 focus:ring-green-400"
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-3 py-3 rounded-md border border-gray-300 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
                />

                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {/* Password Checklist */}
              <div className="mt-2 space-y-1 text-sm">
                <p
                  className={
                    passwordChecks.length ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.length ? "✓" : "•"} At least 8 characters
                </p>
                <p
                  className={
                    passwordChecks.upper ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.upper ? "✓" : "•"} Contains uppercase letter
                </p>
                <p
                  className={
                    passwordChecks.lower ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.lower ? "✓" : "•"} Contains lowercase letter
                </p>
                <p
                  className={
                    passwordChecks.number ? "text-green-600" : "text-gray-600"
                  }
                >
                  {passwordChecks.number ? "✓" : "•"} Contains a number
                </p>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-3 rounded-md border border-gray-300 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
                />

                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </span>
              </div>
            </div>

            {/* Register Button */}
            <div className="w-full flex justify-center">
              <button
                type="submit"
                className="min-w-[160px] appearance-none bg-[green] hover:bg-[#55AA55] active:bg-[#1EB46E] text-white font-bold text-lg py-3 rounded-full shadow-[0_4px_12px_rgba(46,229,138,0.4)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#2EE58A]/50"
              >
                Register
              </button>
            </div>
          </form>

          <div className="text-center mt-6 text-gray-700">
            Already have an account?{" "}
            <a
              onClick={handleLogin}
              className="text-green-500 hover:text-green-600 hover:underline font-semibold cursor-pointer"
            >
              Login
            </a>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
