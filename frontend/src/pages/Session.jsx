import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import ChatSession from "../components/ChatSession";
import API from "../services/api";

export default function Session() {
  const { sessionId } = useParams(); // 👈 read from route /session/:sessionId
  const location = useLocation();
  const [sessionData, setSessionData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  // 🟦 If user refreshed, fetch session info again
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const res = await API.get(`/sessions/${sessionId}`);
        setSessionData(res.data.session);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError(err.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    if (!sessionData) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Loading session...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">
        {error}
      </div>
    );

  if (!sessionData)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        No session data found.
      </div>
    );

  return (
    <>
      <NavBar />
      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium mb-2">
            {sessionData.question}
          </h1>
          <p className="text-gray-600 mb-1">
            <strong>Category:</strong> {sessionData.category}
          </p>
          <p className="text-gray-600 mb-1">
            <strong>Persona:</strong> {sessionData.persona_name}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Session ID: {sessionData.id}
          </p>
        </div>

        {/* 💬 Chat interface */}
        <ChatSession sessionId={sessionId} />
      </section>
    </>
  );
}
