import React from "react";
import Navbar from "../components/NavBar";

export default function SignIn() {
  return (
    <>
      <Navbar />

      <section className="min-h-[85vh] bg-grayAccent flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 md:p-10 w-full max-w-md mt-10">
          {/* --- Heading --- */}
          <h1 className="font-serif text-2xl md:text-3xl text-indigo text-center font-medium mb-2">
            Welcome Back
          </h1>
          <p className="text-graphite text-center mb-8">
            Sign in to continue your journey with DNATE.
          </p>

          {/* --- Form --- */}
          <form className="flex flex-col gap-5">
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
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
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
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" />
                Remember me
              </label>
              <a href="/forgot-password" className="text-primary hover:text-indigo">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors duration-300"
            >
              Sign In
            </button>
          </form>

          {/* --- Divider --- */}
          <div className="my-6 border-t border-grayNeutral"></div>

          {/* --- Footer --- */}
          <p className="text-sm text-center text-graphite">
            Don't have an account?{" "}
            <a  href="/sign-up" className="text-primary hover:text-indigo font-medium">
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
