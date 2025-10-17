import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

export default function SttButton({ onFinal }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const bufferRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += chunk + " ";
      }
      if (final) bufferRef.current += final;
    };

    rec.onend = () => {
      setListening(false);
      if (bufferRef.current.trim()) {
        onFinal?.(bufferRef.current.trim());
        bufferRef.current = "";
      }
    };

    recRef.current = rec;
    setSupported(true);
  }, [onFinal]);

  const start = () => {
    if (!recRef.current) return;
    bufferRef.current = "";
    recRef.current.start();
    setListening(true);
  };

  const stop = () => {
    recRef.current && recRef.current.stop();
  };

  if (!supported) return null;

  return (
    <button
      onClick={listening ? stop : start}
      title={listening ? "Stop recording" : "Start recording"}
      className={`p-3 rounded-xl transition ${
        listening ? "bg-red-500 hover:bg-red-600" : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {listening ? (
        <Square size={18} className="text-white" />
      ) : (
        <Mic size={18} className="text-gray-700" />
      )}
    </button>
  );
}
