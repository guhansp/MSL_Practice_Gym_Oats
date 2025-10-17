import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.svg";
import { LogOut, User } from "lucide-react";
import { logOut } from "../services/authService";

export default function NavBar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      // ignore errors (since logout is client-side)
    } finally {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/signin");
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm px-8 md:px-20 py-6 flex items-center justify-between font-sans sticky top-0 z-50">
      {/* --- Left: Logo --- */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="DNATE Logo" className="h-8 w-auto" />
      </div>

      {/* --- Right: Buttons (Dynamic) --- */}
      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/signin")}
              className="text-primary border border-primary px-4 py-1.5 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-primary text-white px-4 py-1.5 rounded-lg font-medium hover:bg-indigo transition-colors"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-graphite hover:text-primary transition-colors"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
