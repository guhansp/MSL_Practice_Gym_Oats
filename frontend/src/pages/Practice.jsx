// src/pages/Practice.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useRecorder } from "../hooks/useRecorder";
import { Range } from "../components/ui/Range";
import { Field } from "../components/ui/Field";

const TIMER_DEFAULT = 90;

export default function Practice() {
  const { id: questionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [persona, setPersona] = useState("");
  const [mode, setMode] = useState("audio"); // audio | video

  const [seconds, setSeconds] = useState(TIMER_DEFAULT);
  const [running, setRunning] = useState(false);

  const { recording, start, stop, reset: resetRecording, mediaUrl, mediaBlob, err: recErr, stream } =
    useRecorder({ mode });

  const [confidence, setConfidence] = useState(3);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiGet(`/questions/${questionId}`);
        if (mounted) {
          setQuestion(data);
          const defaultPersona = Array.isArray(data?.persona) && data.persona.length ? data.persona[0] : "oncologist";
          setPersona(defaultPersona);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [questionId]);

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

  async function startSession() {
    resetRecording();
    setSeconds(TIMER_DEFAULT);
    const ok = await start();     // robustness: only start timer if recording actually began
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

  const estimatedTime = useMemo(() => question?.estimated_response_time || TIMER_DEFAULT, [question]);

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
      const filename = mode === "video" ? "response.webm" : "response.webm";
      fd.append("recording", mediaBlob, filename);
      fd.append("media_type", mode);
    }
    try {
      await apiPost("/sessions", fd, true);
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Failed to save session. Check server logs.");
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!question) return <div className="p-6 text-red-600">Question not found.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      <div className="lg:col-span-2 space-y-6">
        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {question.category} &middot; {question.difficulty?.toUpperCase()}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900">{question.question}</h1>
              {question.context && <p className="mt-2 text-sm text-gray-500">{question.context}</p>}
            </div>
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs">~{estimatedTime}s</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(question.tags || []).map((t) => (
              <span key={t} className="text-xs text-gray-500">#{t}</span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white space-y-4">
          <div className="flex flex-wrap items-center gap-3">
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

            <label className="text-sm">Persona:</label>
            <select className="rounded-lg border px-3 py-2" value={persona} onChange={(e) => setPersona(e.target.value)}>
              {(question.persona || ["oncologist", "cardiologist", "neurologist"]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-3xl font-semibold tabular-nums">{seconds}s</span>
              {!recording && !running ? (
                <button onClick={startSession} className="rounded-full bg-blue-600 text-white px-4 py-2 hover:opacity-90">Start</button>
              ) : (
                <button onClick={stopSession} className="rounded-full bg-red-600 text-white px-4 py-2 hover:opacity-90">Stop</button>
              )}
            </div>
          </div>

          {mode === "video" && recording && stream && <LiveVideoPreview stream={stream} />}

          {mediaUrl && !recording && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Review your recording:</p>
              {mode === "audio" ? (
                <audio controls src={mediaUrl} className="w-full" />
              ) : (
                <video controls src={mediaUrl} className="w-full rounded-xl" />
              )}
              <div className="flex gap-3">
                <button onClick={redo} className="rounded-full border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Re-record</button>
              </div>
            </div>
          )}

          {recErr && <p className="text-sm text-red-600">{recErr}</p>}
        </section>
      </div>

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
          {!mediaBlob && <p className="text-xs text-gray-500 mt-1">Record and stop to enable save.</p>}
        </section>

        <section className="rounded-2xl border border-black/5 shadow-sm p-5 bg-white">
          <h3 className="text-sm font-semibold mb-2">Tips for this persona</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {persona === "oncologist" && (<><li>Lead with trial outcomes and methodology.</li><li>State limitations; avoid vague claims.</li></>)}
            {persona === "cardiologist" && (<><li>Highlight safety, guidelines, reimbursement.</li><li>Explain workflow impact briefly.</li></>)}
            {persona === "neurologist" && (<><li>Focus on feasibility and caregiver burden.</li><li>Offer patient support resources.</li></>)}
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
