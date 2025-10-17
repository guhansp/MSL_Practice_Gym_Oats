import React, { useEffect, useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import API from "../services/api";
import SttButton from "./SttButton";
import confetti from "canvas-confetti";


export default function ChatSession({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const handleSpeechFinal = (text) => {
    console.log("Final speech input:", text);
    setInput(text);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const [ended, setEnded] = useState(false);

  // 🔹 A fun burst helper
function fireConfetti() {
  // basic burst
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.7 }, // a bit lower on screen
    scalar: 0.9,
  });

  // add a couple side cannons for flair
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
  }, 200);
}


  useEffect(() => {
    const loadSessionQuestion = async () => {
      try {
        console.log("Fetching session data for ID:", sessionId);
        const res = await API.get(`/sessions/session/${sessionId}`);
        const session = res.data.session;
        if (session?.question) {
          setMessages([
            {
              id: Date.now(),
              sender: "coach",
              text: session.question,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load question:", err);
        setError("Failed to load session question.");
      }
    };
    loadSessionQuestion();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || ended) return;

    const userText = input.trim();
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      console.log("Updated messages:", updated);
      return updated;
    });
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
    } catch (err) {
      console.error("Chat error:", err);
      setError("Error communicating with coach.");
    } finally {
      setLoading(false);
    }
  };

  // add inside ChatSession component, above the return()
  const handleEndConversation = async () => {
    if (!sessionId || ended) return;
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
      // 👇 prevent any more user input after feedback arrives
      setEnded(true);
    } catch (err) {
      console.error("End conversation / feedback error:", err);
      setError("Failed to generate feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto flex flex-col min-h-[70vh]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {messages.map((m) => (
          <ChatBubble key={m.id} sender={m.sender} text={m.text} />
        ))}

        {/* Bot typing indicator */}
        {loading && (
          <div className="flex items-start gap-2 animate-pulse">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-500">
              A
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl text-sm text-gray-700">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
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
          disabled={ended || loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || ended}
          className={`bg-indigo-600 hover:bg-indigo-700 text-black p-3 rounded-xl transition ${
            loading || ended ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <SendHorizonal size={18} />
        </button>

        <div className="flex items-center">
          {!ended ? (
            <SttButton onFinal={handleSpeechFinal} disabled={loading} />
          ) : null}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleEndConversation}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-6 py-2 rounded-lg shadow-sm transition-all"
        >
          End Conversation
        </button>
      </div>
    </div>
  );
}

// 💬 Chat bubble component
function ChatBubble({ sender, text }) {
  const isUser = sender?.toLowerCase() === "user";

  return (
    <div
      className={`flex items-start gap-2 w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold bg-indigo-100 text-indigo-600">
          A
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[75%] break-words ${
          isUser
            ? "bg-gray-100  text-black rounded-br-none self-end"
            : "bg-gray-100 text-gray-800 rounded-bl-none self-start"
        }`}
      >
        {text}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold bg-indigo-600 text-black">
          U
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
    </div>
  );
}
