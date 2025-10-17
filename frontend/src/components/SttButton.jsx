
import React, { useEffect, useRef, useState } from "react";


export default function SttButton({ onFinal }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    recRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += chunk + " ";
      }
      if (final) setText((prev) => (prev + final).trim());
    };
    rec.onend = () => setListening(false);
    setSupported(true);
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setText("");
    recRef.current.start();
    setListening(true);
  };
  const stop = () => recRef.current && recRef.current.stop();

  if (!supported) return <div>Speech recognition not supported in this browser.</div>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {!listening ? (
          <button onClick={start}>🎙️ Start</button>
        ) : (
          <button onClick={stop}>■ Stop</button>
        )}
        {!listening && text && (
          <button onClick={() => onFinal?.(text)}>Use Transcript</button>
        )}
        {!listening && text && (
          <button onClick={() => setText("")}>Clear</button>
        )}
      </div>
      <textarea value={text} readOnly rows={5} placeholder="Transcript..." />
    </div>
  );
}
