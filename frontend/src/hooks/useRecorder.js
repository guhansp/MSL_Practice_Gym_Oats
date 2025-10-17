// src/hooks/useRecorder.js
import { useEffect, useRef, useState } from "react";

export function useRecorder({ mode = "audio" } = {}) {
  const [recording, setRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [err, setErr] = useState(null);
  const [stream, setStream] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [stream, mediaUrl]);

  async function start() {
    setErr(null);
    try {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      setMediaUrl(null);
      setMediaBlob(null);
      const constraints = mode === "video" ? { audio: true, video: true } : { audio: true };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      const mr = new MediaRecorder(s, { mimeType: mode === "video" ? "video/webm" : "audio/webm" });
      recorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mode === "video" ? "video/webm" : "audio/webm" });
        const url = URL.createObjectURL(blob);
        setMediaBlob(blob);
        setMediaUrl(url);
        s.getTracks().forEach((t) => t.stop());
        setStream(null);
      };
      mr.start();
      setRecording(true);
      return true;  // robustness: signal success
    } catch (e) {
      setErr(e?.message || "Failed to start recording");
      setRecording(false);
      return false; // robustness: signal failure
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function reset() {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setMediaBlob(null);
    setErr(null);
  }

  return { recording, start, stop, reset, mediaUrl, mediaBlob, err, stream };
}
