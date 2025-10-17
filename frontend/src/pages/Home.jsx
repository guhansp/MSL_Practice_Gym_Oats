import React from "react";
import Navbar from "../components/Navbar.jsx";

export default function Home() {
  return (
    <>
      <Navbar />

      <section className="min-h-[80vh] bg-grayAccent flex flex-col items-center justify-center px-6 text-center font-sans">
        <div className="max-w-3xl">
          {/* Headline — Domine */}
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-indigo leading-snug">
            Breakthrough Innovation <br />
            Demands Breakthrough <br />
            <span className="text-primary">Communication.</span>
          </h1>

          {/* Subheadline — Manrope */}
          <p className="mt-6 text-base md:text-lg text-graphite leading-relaxed font-normal">
            Make strategic communication your competitive advantage with proven
            programs that deliver measurable results.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <button className="bg-primary hover:bg-indigo text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-300">
              Book Your Discovery Call →
            </button>
          </div>

          {/* Tagline */}
          <p className="mt-10 text-xs md:text-sm text-graphite font-mono tracking-wide">
            10K+ leaders trained and transformed worldwide.
          </p>
        </div>
      </section>
    </>
  );
}
