import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/reset-confirmation");
  };

  return (
    <>
      <NavBar />
      <section className="min-h-[85vh] bg-grayAccent flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 md:p-10 w-full max-w-md mt-10">
          <h1 className="font-serif text-2xl md:text-3xl text-indigo text-center font-medium mb-2">
            Forgot Password?
          </h1>
          <p className="text-graphite text-center mb-8 text-sm md:text-base">
            Enter your registered email address and we'll send you instructions
            to reset your password.
          </p>

          {/* --- Form --- */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
                required
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors duration-300"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
