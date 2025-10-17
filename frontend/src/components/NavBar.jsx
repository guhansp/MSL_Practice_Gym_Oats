import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // lightweight icon library
import logo from "../assets/Logo.svg";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm px-6 md:px-20 py-6 flex items-center justify-between font-sans sticky top-0 z-50">
      {/* --- Left: Logo --- */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="DNATE Logo"
          className="h-8 w-auto md:h-8"
        />
      </div>

      {/* --- Desktop Navigation --- */}
      <ul className="hidden md:flex items-center gap-10 text-graphite text-sm font-medium">
        <li className="hover:text-primary transition-colors cursor-pointer flex items-center">
          The CLEAR™ System
          <span className="ml-1 text-xs bg-blue-100 text-primary px-1.5 py-0.5 rounded">
            New
          </span>
        </li>
        <li className="hover:text-primary transition-colors cursor-pointer">
          Articles
        </li>
        <li className="hover:text-primary transition-colors cursor-pointer">
          Podcast
        </li>
        <li className="hover:text-primary transition-colors cursor-pointer">
          About & Contact
        </li>
      </ul>

      {/* --- Right: CTA Button (Desktop) --- */}
      <button className="hidden md:block bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors text-sm md:text-base">
        Book Your Discovery Call
      </button>

      {/* --- Mobile Menu Toggle --- */}
      <div className="md:hidden">
        {isOpen ? (
          <X
            className="h-6 w-6 text-indigo cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        ) : (
          <Menu
            className="h-6 w-6 text-indigo cursor-pointer"
            onClick={() => setIsOpen(true)}
          />
        )}
      </div>

      {/* --- Mobile Menu Panel --- */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden animate-slideDown">
          <ul className="flex flex-col items-center gap-4 py-6 text-graphite text-sm font-medium">
            <li
              className="hover:text-primary transition-colors cursor-pointer flex items-center"
              onClick={() => setIsOpen(false)}
            >
              The CLEAR™ System
              <span className="ml-1 text-xs bg-blue-100 text-primary px-1.5 py-0.5 rounded">
                New
              </span>
            </li>
            <li
              className="hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Articles
            </li>
            <li
              className="hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              Podcast
            </li>
            <li
              className="hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              About & Contact
            </li>

            <button
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo transition-colors text-sm mt-2"
              onClick={() => setIsOpen(false)}
            >
              Book Your Discovery Call
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
}
