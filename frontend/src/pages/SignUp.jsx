import React, { useState } from "react";
import NavBar from "../components/NavBar";
import pattern from "../assets/pattern.png";
import { signUp } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        email: form.email,
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      };

      const res = await signUp(payload);
      localStorage.setItem("token", res.token);

      setMessage("✅ Account created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />

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
            Create Your Account
          </h1>
          <p className="text-graphite text-center mb-8 text-sm md:text-base">
            Join DNATE and start transforming the way you communicate.
          </p>

          {/* --- Form --- */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-graphite mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  placeholder="Jane"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
                  required
                />
              </div>

              <div className="text-left">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-graphite mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
                />
              </div>
            </div>

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
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-300 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-indigo cursor-pointer"
              }`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
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
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-primary hover:text-indigo font-medium"
            >
              Sign In
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