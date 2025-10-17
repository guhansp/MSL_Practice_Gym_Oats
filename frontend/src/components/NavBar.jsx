// components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Logo.svg";
import { LogOut, User, Menu, X } from "lucide-react";
import { logOut } from "../services/authService";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setMobileMenuOpen(false);
      navigate("/sign-in");
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const authenticatedLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Questions", path: "/questions" },
    { label: "Personas", path: "/personas" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-white shadow-sm px-4 sm:px-8 md:px-20 py-4 sm:py-6 flex items-center justify-between font-sans sticky top-0 z-50">
      {/* --- Left: Logo --- */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => handleNavigation("/")}
      >
        <img src={logo} alt="DNATE Logo" className="h-6 sm:h-8 w-auto" />
      </div>

      {/* --- Center: Navigation Links (Desktop - Logged In Only) --- */}
      {isLoggedIn && (
        <div className="hidden md:flex items-center gap-8">
          {authenticatedLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavigation(link.path)}
              className={`text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-graphite border-b-2 border-transparent pb-1 hover:text-primary hover:border-primary/30"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* --- Right: Auth Buttons (Desktop) --- */}
      <div className="hidden md:flex items-center gap-3">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => handleNavigation("/sign-in")}
              className="text-primary border border-primary px-5 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-grayLight text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation("/sign-up")}
              className="bg-primary text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-primary/90 text-sm"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigation("/profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                isActive("/profile")
                  ? "bg-grayLight text-primary border border-primary"
                  : "text-graphite hover:bg-grayLight border border-transparent"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-graphite px-3 py-2 rounded-lg transition-all duration-200 hover:bg-grayLight"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* --- Mobile Menu Button --- */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-graphite transition-colors p-2"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* --- Mobile Menu Dropdown --- */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-grayNeutral md:hidden">
          <div className="px-4 py-4 space-y-2">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNavigation("/sign-in")}
                  className="w-full text-primary border border-primary px-5 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-grayLight text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation("/sign-up")}
                  className="w-full bg-primary text-white px-5 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-primary/90 text-sm"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                {/* Navigation Links */}
                {authenticatedLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavigation(link.path)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                      isActive(link.path)
                        ? "bg-grayLight text-primary border-l-4 border-primary"
                        : "text-graphite hover:bg-grayLight"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                {/* Divider */}
                <div className="border-t border-grayNeutral my-3"></div>

                {/* Profile */}
                <button
                  onClick={() => handleNavigation("/profile")}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                    isActive("/profile")
                      ? "bg-grayLight text-primary border-l-4 border-primary"
                      : "text-graphite hover:bg-grayLight"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm text-graphite hover:bg-grayLight"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}