import React from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/sign-in");
  };

  return (
    <>
      <NavBar />

      <section className="min-h-[85vh] bg-grayAccent flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 md:p-10 w-full max-w-md mt-10">
          {/* --- Heading --- */}
          <h1 className="font-serif text-2xl md:text-3xl text-indigo text-center font-medium mb-2">
            Reset Your Password
          </h1>
          <p className="text-graphite text-center mb-8 text-sm md:text-base">
            Create a new password for your DNATE account.
          </p>

          {/* --- Form --- */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="text-left">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-graphite mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter a strong password"
                required
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
              />
            </div>

            <div className="text-left">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-graphite mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter your password"
                required
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors duration-300"
            >
              Reset Password
            </button>
          </form>

          {/* --- Divider --- */}
          <div className="my-6 border-t border-grayNeutral"></div>

          {/* --- Footer --- */}
          <p className="text-sm text-center text-graphite">
            Back to{" "}
            <a
              href="/sign-in"
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
