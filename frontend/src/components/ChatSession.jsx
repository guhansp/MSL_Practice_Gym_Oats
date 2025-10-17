import React, { useEffect, useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import API from "../services/api";
import SttButton from "./SttButton";
import confetti from "canvas-confetti";

export default function ChatSession({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSelfAssess, setShowSelfAssess] = useState(false);
  const [sessionStatus, setSessionStatus] = useState({
    ended: false,
    selfAssessed: false,
  });

  const bottomRef = useRef(null);
  const handleSpeechFinal = (text) => setInput(text);

  // 🎉 Confetti effect
  function fireConfetti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 },
      scalar: 0.9,
    });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
    }, 200);
  }

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await API.get(`/sessions/session/${sessionId}`);
        const session = res.data.session;
        console.log("Loaded session:", session);

        if (session?.question) {
          setMessages([
            { id: Date.now(), sender: "coach", text: session.question },
          ]);
        }

        setSessionStatus({
          ended: !!session?.completed_at,
          selfAssessed:
            session?.clarity_score !== null &&
            session?.variability_score !== null &&
            session?.polarity_score !== null,
        });
        console.log("Session status:", sessionStatus);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load session data.");
      }
    };

    loadSession();
  }, [sessionId]);

  // 🧭 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
  const handleSend = async () => {
    if (!input.trim() || loading || sessionStatus.ended) return;

    const userText = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post(`/conversation/${sessionId}/chat`, {
        message: userText,
      });
      const reply = res.data?.message || "(No response)";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "coach", text: reply },
      ]);
    } catch {
      setError("Error communicating with coach.");
    } finally {
      setLoading(false);
    }
  };

  // 🛑 End conversation
  const handleEndConversation = async () => {
    if (!sessionId || sessionStatus.ended) return;
    setLoading(true);
    setError("");

    try {
      const res = await API.post(`/conversation/${sessionId}/feedback`);
      const feedback = res.data?.feedback || "(No feedback returned)";
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "coach", text: feedback },
      ]);
      fireConfetti();

      setSessionStatus((prev) => ({ ...prev, ended: true }));
    } catch {
      setError("Failed to generate feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) {
    return (
      <div className="text-center text-red-500 font-medium py-20">
        Session ID missing. Please start from Question Selection.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto flex flex-col min-h-[70vh] relative">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {messages.map((m) => (
          <ChatBubble key={m.id} sender={m.sender} text={m.text} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="text-red-500 text-center text-sm mb-2">{error}</div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-200 pt-4 mt-2">
        <textarea
          className="flex-1 resize-none border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows={2}
          value={input}
          placeholder="Type your response..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={sessionStatus.ended || loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || sessionStatus.ended}
          className={`bg-indigo-600 hover:bg-indigo-700 text-black p-3 rounded-xl transition ${
            loading || sessionStatus.ended
              ? "opacity-60 cursor-not-allowed"
              : ""
          }`}
        >
          <SendHorizonal size={18} />
        </button>
        {!sessionStatus.ended && (
          <SttButton onFinal={handleSpeechFinal} disabled={loading} />
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-center mt-4 gap-3">
        <button
          onClick={handleEndConversation}
          disabled={sessionStatus.ended}
          className={`bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-6 py-2 rounded-lg shadow-sm transition-all ${
            sessionStatus.ended ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          End Conversation
        </button>

        {sessionStatus.ended && (
          <button
            onClick={() => setShowSelfAssess(true)}
            disabled={sessionStatus.selfAssessed}
            className={`bg-primary hover:bg-indigo text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition-all ${
              sessionStatus.selfAssessed ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {sessionStatus.selfAssessed ? "Self-Assessed ✅" : "Self-Assess"}
          </button>
        )}
      </div>

      {showSelfAssess && (
        <SelfAssessModal
          sessionId={sessionId}
          onClose={() => setShowSelfAssess(false)}
          onSubmitted={() =>
            setSessionStatus((prev) => ({ ...prev, selfAssessed: true }))
          }
        />
      )}
    </div>
  );
}

// 💬 Chat bubble
function ChatBubble({ sender, text }) {
  const isUser = sender?.toLowerCase() === "user";
  return (
    <div
      className={`flex items-start gap-2 w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold bg-indigo-100 text-indigo-600">
          A
        </div>
      )}
      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[75%] break-words ${
          isUser
            ? "bg-gray-100 text-black rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        {text}
      </div>
      {isUser && (
        <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold bg-indigo-600 text-black">
          U
        </div>
      )}
    </div>
  );
}

// ⌨️ Typing dots
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-pulse">
      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-500">
        A
      </div>
      <div className="bg-gray-100 px-4 py-3 rounded-2xl text-sm text-gray-700 flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
}

// 🧾 Self-assessment popup
function SelfAssessModal({ sessionId, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    user_notes: "",
    clarity_score: "",
    variability_score: "",
    polarity_score: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["clarity_score", "variability_score", "polarity_score"].includes(name)
    ) {
      if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setMessage("");

    if (
      !form.clarity_score ||
      !form.variability_score ||
      !form.polarity_score ||
      form.clarity_score.trim() === "" ||
      form.variability_score.trim() === "" ||
      form.polarity_score.trim() === ""
    ) {
      setMessage("⚠️ Please fill in all score fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_notes: form.user_notes.trim(),
        clarity_score: parseFloat(form.clarity_score),
        variability_score: parseFloat(form.variability_score),
        polarity_score: parseFloat(form.polarity_score),
      };

      await API.post(`/conversation/${sessionId}/selfassess`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("✅ Self-assessment submitted successfully!");
      setTimeout(() => {
        onClose();
        if (typeof onSubmitted === "function") onSubmitted();
      }, 1500);
    } catch (err) {
      console.error("Self-assess error:", err.response?.data || err.message);
      setMessage("❌ Failed to submit self-assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Self-Assessment
        </h2>

        <div className="space-y-3">
          <textarea
            name="user_notes"
            value={form.user_notes}
            onChange={handleChange}
            placeholder="Your notes "
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-indigo-400"
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <ScoreInput
              label="Clarity"
              name="clarity_score"
              value={form.clarity_score}
              onChange={handleChange}
            />
            <ScoreInput
              label="Variability"
              name="variability_score"
              value={form.variability_score}
              onChange={handleChange}
            />
            <ScoreInput
              label="Polarity"
              name="polarity_score"
              value={form.polarity_score}
              onChange={handleChange}
            />
          </div>
        </div>

        {message && <p className="text-center text-sm mt-3">{message}</p>}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-primary hover:bg-indigo text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition-all"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreInput({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        max="10"
        step="0.1"
        className="border rounded-lg px-2 py-1 text-sm text-center focus:ring-indigo-400"
      />
    </div>
  );
}
