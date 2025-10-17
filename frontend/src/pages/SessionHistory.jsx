import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import API from "../services/api";
import { ArrowLeft, User, Bot, Calendar, Target, Award } from "lucide-react";

export default function SessionHistory() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    fetchConversation();
  }, [sessionId]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/sessions/${sessionId}/getConversationSummary`);
      setConversation(response.data.conversation);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError(err.response?.data?.error || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-graphite font-sans">Loading conversation history...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-serif text-indigo font-semibold mb-2">
              Error Loading Conversation
            </h2>
            <p className="text-graphite mb-6">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <section className="min-h-screen bg-grayAccent px-4 sm:px-6 lg:px-8 py-6 sm:py-10 font-sans">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-base mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-serif text-indigo font-semibold mb-2">
            Session History
          </h1>
          <p className="text-graphite text-sm">
            View your complete practice session conversation
          </p>
        </div>

        {/* Session Info Card */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-primary">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-graphite uppercase tracking-wide font-semibold mb-1">
                    Date
                  </p>
                  <p className="text-primary font-medium">
                    {conversation?.session?.started_at
                      ? new Date(conversation.session.started_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-graphite uppercase tracking-wide font-semibold mb-1">
                    Persona
                  </p>
                  <p className="text-primary font-medium">
                    {conversation?.session?.persona_id
                      ? conversation.session.persona_id.charAt(0).toUpperCase() +
                        conversation.session.persona_id.slice(1)
                      : "N/A"}
                  </p>
                  <p className="text-xs text-graphite">
                    {conversation?.session?.persona_name || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-graphite uppercase tracking-wide font-semibold mb-1">
                    Category
                  </p>
                  <p className="text-primary font-medium">
                    {conversation?.session?.category || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-graphite uppercase tracking-wide font-semibold mb-1">
                    Confidence Rating
                  </p>
                  <p className="text-primary font-medium text-lg">
                    {conversation?.session?.confidence_rating
                      ? `${conversation.session.confidence_rating}/5`
                      : "Not rated"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Messages */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-serif text-primary font-semibold mb-6">
              Conversation
            </h2>

            {!conversation?.messages || conversation.messages.length === 0 ? (
              <p className="text-graphite text-center py-8">
                No messages found for this session.
              </p>
            ) : (
              <div className="space-y-4">
                {conversation.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-primary text-white"
                          : "bg-indigo text-white"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-grayLight text-graphite rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {message.timestamp
                          ? new Date(message.timestamp).toLocaleTimeString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Section (if available) */}
          {conversation?.session?.feedback && (
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mt-6">
              <h2 className="text-2xl font-serif text-primary font-semibold mb-4">
                Session Feedback
              </h2>
              <div className="bg-grayLight border border-grayNeutral p-4 rounded-lg">
                <p className="text-graphite whitespace-pre-wrap">
                  {conversation.session.feedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}