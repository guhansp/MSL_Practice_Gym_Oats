
# DNATE MSL Practice Gym — Frontend Add‑On (Recording + Self‑Assessment)

This folder adds the **Recording Workflow** and **Self‑Assessment** screens to a Vite + React + Tailwind frontend (like your `/frontend` folder).  
It provides:
- Audio/Video recording with `MediaRecorder` (Start/Stop, Timer, Review, Re‑record)
- Self‑assessment (Confidence 1–5, Quality 1–5, Notes)
- Save session to history via `POST /sessions` (multipart FormData)

> **Assumptions**
> - Your frontend runs on **Vite + React + Tailwind**.
> - Your backend exposes endpoints (adjust if different):
>   - `GET /questions/:id` → returns a question object
>   - `POST /sessions` → accepts `FormData` with `recording` + metadata
> - You use `react-router-dom` (so we can route to `/practice/:id`).
> - Frontend is configured with `VITE_API_BASE` (e.g., `http://localhost:3001`).

## 1) Files in this Add‑On

```
src/
  lib/
    api.js
  hooks/
    useRecorder.js
  components/
    ui/
      Field.js
      Range.js
  pages/
    Practice.jsx
README.md
```

## 2) How to Install into Your Project

1) **Copy files** into your frontend (Vite) project at the same relative paths:
```
your-frontend/
  src/
    lib/api.js
    hooks/useRecorder.js
    components/ui/Field.js
    components/ui/Range.js
    pages/Practice.jsx
```

2) **Install router (if missing):**
```bash
npm i react-router-dom
```

3) **Add a route** to `Practice` (example for `src/main.jsx` or wherever you define routes):
```jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Practice from "./pages/Practice.jsx";

const router = createBrowserRouter([
  // other routes …
  { path: "/practice/:id", element: <Practice /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

4) **Set your API base URL** in `frontend/.env.local` (or `.env` used by Vite):
```
VITE_API_BASE=http://localhost:3001
```

5) **Run the app:**
```bash
npm run dev
# open the browser at the URL shown (usually http://localhost:5173)
```

## 3) Endpoint Contracts (Adjust if your backend differs)

### GET /questions/:id → 200 JSON
```json
{
  "id": 5,
  "question": "Is there any data supporting use in combination with other therapies?",
  "category": "Clinical Data & Evidence",
  "difficulty": "medium",
  "persona": ["oncologist", "cardiologist"],
  "tags": ["combination"],
  "estimated_response_time": 90,
  "context": "Physician considering combination treatment approaches"
}
```

### POST /sessions → 200 JSON
Multipart **FormData** with these fields:
- `question_id` (number)
- `persona_id` (string)
- `confidence` (1–5)
- `quality` (1–5)
- `notes` (string)
- `duration` (seconds)
- `recording` (file, webm)
- `media_type` (`audio` or `video`)

Server should store the file (e.g., S3/Supabase Storage) and persist metadata.

> **Express example (sketch):**
> ```js
> import multer from "multer";
> const upload = multer(); // memory storage
> router.post("/sessions", upload.single("recording"), async (req, res) => {
>   const { question_id, persona_id, confidence, quality, notes, duration, media_type } = req.body;
>   const file = req.file; // webm buffer (optional)
>   // Persist file to storage and save DB row with returned URL
>   return res.json({ ok: true });
> });
> ```

## 4) UI Preview

- Select **Mode**: audio/video
- Select **Persona**
- **Start** → 90s **timer** counts down while recording
- **Stop** → Review **audio/video**; **Re‑record** if needed
- Fill **Self‑Assessment** (confidence, quality, notes)
- **Save Session** → `POST /sessions`, then navigate to `/dashboard`

## 5) Tailwind CSS

No special configuration beyond a standard Tailwind setup is required. Classes are vanilla Tailwind.

---

### Troubleshooting

- **`getUserMedia` permissions**: Browser will ask for mic/camera access. Allow it.
- **CORS**: Ensure your backend allows `http://localhost:5173` origin during development.
- **Save button disabled**: It enables only after you have a recording (`Stop` pressed).

Happy hacking! 🚀
