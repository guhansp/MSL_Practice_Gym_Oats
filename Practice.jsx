// src/pages/Practice.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api.jsx";
import { useRecorder } from "../hooks/useRecorder.jsx"; // ← named export
import Range from "../components/ui/Range.jsx";         // ← default export
import Field from "../components/ui/Field.jsx";         // ← default export

const TIMER_DEFAULT = 90;

export default function Practice() {
  const { id: questionId } = useParams();
  const navigate = useNavigate();

  // Question + persona
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [persona, setPersona] = useState("");

  // Recording mode & timer
  const [mode, setMode] = useState("audio"); // "audio" | "video"
  const [seconds, setSeconds] = useState(TIMER_DEFAULT);
  const [running, setRunning] = useState(false);

  const {
    recording,
    start,
    stop,
    reset: resetRecording,
    mediaUrl,
    mediaBlob,
    err: recErr,
    stream,
  } = useRecorder({ mode });

  // Self-assessment
  const [confidence, setConfidence] = useState(3);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");

  // Load selected question (unwraps { message, data } from backend)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiGet(`/questions/${questionId}`);
        const q = resp?.data || resp || {};
        const normalized = {
          id: q.id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          context: q.context,
          tags: Array.isArray(q.tags) ? q.tags : [],
          estimated_response_time:
            typeof q.estimated_response_time === "number" ? q.estimated_response_time : TIMER_DEFAULT,
          // backend doesn't supply persona → provide safe defaults
          persona: ["oncologist", "cardiologist", "neurologist"],
        };
        if (!mounted) return;
        setQuestion(normalized);
        setPersona(normalized.persona[0]);
        setLoading(false);
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [questionId]);

  // Countdown
  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      stop();
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds, stop]);

  // Recording controls
  async function startSession() {
    resetRecording();
    setSeconds(TIMER_DEFAULT);
    const ok = await start(); // only start timer if recording really started
    if (ok) setRunning(true);
  }
  function stopSession() {
    stop();
    setRunning(false);
  }
  function redo() {
    resetRecording();
    setSeconds(TIMER_DEFAULT);
  }

  const estimatedTime = useMemo(
    () => question?.estimated_response_time || TIMER_DEFAULT,
    [question]
  );

  // Save session (multipart)
  async function saveSession() {
    if (!question) return;
    const fd = new FormData();
    fd.append("question_id", question.id);
    fd.append("persona_id", persona);
    fd.append("confidence", String(confidence));
    fd.append("quality", String(quality));
    fd.append("notes", notes);
    fd.append("duration", String(TIMER_DEFAULT - seconds));
    if (mediaBlob) {
      fd.append("recording", mediaBlob, "response.webm");
      fd.append("media_type", mode);
    }
    try {
      await apiPost("/sessions", fd, true);
      navigate("/dashboard"); // or wherever your history page lives
    } catch (e) {
      console.error(e);
      alert("Failed to save session. Check server logs.");
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!question) return <div className="p-6 text-red-600">Question not found.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Left: question & recorder */}
      <div className="lg:col-span-2 space-y-6">
        {/* Question card */}
        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {question.category} &middot; {question.difficulty?.toUpperCase()}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900">{question.question}</h1>
              {question.context && (
                <p className="mt-2 text-sm text-gray-500">{question.context}</p>
              )}
            </div>
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs">
              ~{estimatedTime}s
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(question.tags || []).map((t) => (
              <span key={t} className="text-xs text-gray-500">
                #{t}
              </span>
            ))}
          </div>
        </section>

        {/* Recorder */}
        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode */}
            <label className="text-sm">Mode:</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={mode}
              onChange={(e) => e.target.value && !recording && setMode(e.target.value)}
              disabled={recording}
            >
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>

            {/* Persona */}
            <label className="text-sm">Persona:</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            >
              {(question.persona || ["oncologist", "cardiologist", "neurologist"]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Timer + control */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-3xl font-semibold tabular-nums">{seconds}s</span>
              {!recording && !running ? (
                <button
                  onClick={startSession}
                  className="rounded-full bg-blue-600 text-white px-4 py-2 hover:opacity-90"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="rounded-full bg-red-600 text-white px-4 py-2 hover:opacity-90"
                >
                Stop
                </button>
              )}
            </div>
          </div>

          {/* Live preview (video) */}
          {mode === "video" && recording && stream && (
            <LiveVideoPreview stream={stream} />
          )}

          {/* Review after recording */}
          {mediaUrl && !recording && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Review your recording:</p>
              {mode === "audio" ? (
                <audio controls src={mediaUrl} className="w-full" />
              ) : (
                <video controls src={mediaUrl} className="w-full rounded-xl" />
              )}
              <div className="flex gap-3">
                <button
                  onClick={redo}
                  className="rounded-full border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Re-record
                </button>
              </div>
            </div>
          )}

          {recErr && <p className="text-sm text-red-600">{recErr}</p>}
        </section>
      </div>

      {/* Right: self-assessment */}
      <aside className="space-y-6">
        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white space-y-4">
          <h2 className="text-lg font-semibold">Self-Assessment</h2>
          <Range label="Confidence (1–5)" value={confidence} onChange={setConfidence} />
          <Range label="Quality (1–5)" value={quality} onChange={setQuality} />
          <Field label="Notes / Reflection">
            <textarea
              className="w-full rounded-xl border px-3 py-2 text-sm"
              rows={5}
              placeholder="What went well? What will you improve next time?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <button
            onClick={saveSession}
            className="w-full rounded-full bg-blue-600 text-white px-4 py-2 hover:opacity-90"
            disabled={!mediaBlob}
          >
            Save Session
          </button>
          {!mediaBlob && (
            <p className="text-xs text-gray-500 mt-1">Record and stop to enable save.</p>
          )}
        </section>

        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white">
          <h3 className="text-sm font-semibold mb-2">Tips for this persona</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {persona === "oncologist" && (
              <>
                <li>Lead with trial outcomes and methodology.</li>
                <li>State limitations; avoid vague claims.</li>
              </>
            )}
            {persona === "cardiologist" && (
              <>
                <li>Highlight safety, guidelines, reimbursement.</li>
                <li>Explain workflow impact briefly.</li>
              </>
            )}
            {persona === "neurologist" && (
              <>
                <li>Focus on feasibility and caregiver burden.</li>
                <li>Offer patient support resources.</li>
              </>
            )}
          </ul>
        </section>
      </aside>
    </div>
  );
}

function LiveVideoPreview({ stream }) {
  const [el, setEl] = useState(null);
  useEffect(() => {
    if (el) {
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, [el, stream]);
  return <video ref={setEl} className="w-full rounded-xl bg-black/5" muted playsInline />;
}