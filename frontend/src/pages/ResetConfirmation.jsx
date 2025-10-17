import React from "react";
import NavBar from "../components/NavBar";

export default function ResetConfirmation() {
  return (
    <>
      <NavBar />
      <section className="min-h-[85vh] bg-grayAccent flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 md:p-10 w-full max-w-md mt-10 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-indigo font-medium mb-4">
            Check Your Inbox.
          </h1>
          <p className="text-graphite text-sm md:text-base mb-6">
            We've sent a password-reset link to your registered email address.
            Follow the instructions there to set a new password.
          </p>
          <a
            href="/signin"
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors duration-300 inline-block"
          >
            Back to Sign In
          </a>
        </div>
      </section>
    </>
  );
}
