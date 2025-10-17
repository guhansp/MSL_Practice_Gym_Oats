import React from "react";
import NavBar from "../components/NavBar";
import pattern from "../assets/pattern.png";

export default function SignUp() {
  return (
    <>
      <NavBar />

      <section className="min-h-[85vh] bg-grayAccent flex flex-col items-center justify-center font-sans px-4"
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
          <form className="flex flex-col gap-5">
            <div className="text-left">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-graphite mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
              />
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
                placeholder="Create a strong password"
                className="w-full px-4 py-2.5 border border-grayNeutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-graphite"
              />
            </div>

            {/* <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-primary" />
              <span className="text-graphite">
                I agree to the{" "}
                <a href="#" className="text-primary hover:text-indigo">
                  Terms & Conditions
                </a>
              </span>
            </div> */}

            <button
              type="submit"
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors duration-300"
            >
              Sign Up
            </button>
          </form>

          {/* --- Divider --- */}
          <div className="my-6 border-t border-grayNeutral"></div>

          {/* --- Footer --- */}
          <p className="text-sm text-center text-graphite">
            Already have an account?{" "}
            <a href="/signin" className="text-primary hover:text-indigo font-medium">
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
