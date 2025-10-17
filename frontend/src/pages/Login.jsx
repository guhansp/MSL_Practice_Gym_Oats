import React, { useState } from "react";
import Navbar from "../components/NavBar";
import pattern from "../assets/pattern.png";
import { logIn } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await logIn(form);

      // ✅ Save JWT token
      localStorage.setItem("token", res.token);

      setMessage("✅ Login successful!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section
        className="min-h-[85vh] bg-grayAccent flex flex-col items-center justify-center font-sans px-4"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundRepeat: "repeat",
          backgroundSize: "contain",
        }}
      >
        <div className="bg-white shadow-md rounded-2xl p-8 md:p-10 w-full max-w-md mt-10">
          {/* --- Heading --- */}
          <h1 className="font-serif text-2xl md:text-3xl text-indigo text-center font-medium mb-2">
            Welcome Back
          </h1>
          <p className="text-graphite text-center mb-8 text-sm md:text-base">
            Sign in to continue your journey with DNATE.
          </p>

          {/* --- Form --- */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-left">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-graphite mb-1"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
                required
              />
            </div>

            <div className="text-left">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-graphite mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
                required
              />
            </div>

            {/* <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-primary hover:text-indigo"
              >
                Forgot password?
              </a>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-300 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-indigo cursor-pointer"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* --- Status Message --- */}
          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* --- Divider --- */}
          <div className="my-6 border-t border-grayNeutral"></div>

          {/* --- Footer --- */}
          <p className="text-sm text-center text-graphite">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary hover:text-indigo font-medium"
            >
              Sign Up
            </a>
          </p>
        </div>

        {/* --- Tagline --- */}
        <p className="mt-10 text-xs md:text-sm text-graphite font-mono tracking-wide">
          Data-Driven Impact • Confidence Through Expertise
        </p>
      </section>
    </>
  );
}
