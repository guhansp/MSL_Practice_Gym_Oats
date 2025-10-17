import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { fetchQuestions } from "../services/questionService";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function QuestionSelection() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    difficulty: "All",
  });

  const [questions, setQuestions] = useState([]);
  const [personasByQuestion, setPersonasByQuestion] = useState({});
  const [selectedPersonas, setSelectedPersonas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleStartPractice = async (question) => {
    try {
      const personaName = selectedPersonas[question.id];

      if (!personaName || personaName === "—") {
        alert("Please select a persona before starting practice.");
        return;
      }

      const res = await API.post("/sessions", {
        questionId: question.id,
        personaId: personaName,
      });

      const session = res.data.session;

      if (session?.id) {
        navigate(`/session/${session.id}`, { state: session });
      } else {
        alert("Failed to create session");
      }
    } catch (err) {
      console.error("Error starting practice:", err);
      alert(err.response?.data?.error || "Failed to start practice session.");
    }
  };

  // --- Load all questions and their personas ---
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetchQuestions();
        setQuestions(res.data);

        // Fetch personas for each question
        const personaMap = {};
        const selectionMap = {};

        await Promise.all(
          res.data.map(async (q) => {
            try {
              const resp = await API.get(`/questions/${q.id}/personas`);
              personaMap[q.id] = resp.data.personas || [];
              selectionMap[q.id] = resp.data.personas?.[0] || "—";
            } catch {
              personaMap[q.id] = [];
              selectionMap[q.id] = "—";
            }
          })
        );

        setPersonasByQuestion(personaMap);
        setSelectedPersonas(selectionMap);
      } catch (err) {
        console.error("Error loading questions:", err);
        setError("Failed to load questions or personas.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // --- Filters ---
  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question
      ?.toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchCategory =
      filters.category === "All" || q.category === filters.category;
    const matchDifficulty =
      filters.difficulty === "All" || q.difficulty === filters.difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  // --- Difficulty color ---
  const getDifficultyColor = (difficulty) => {
    const d = difficulty?.toLowerCase();
    if (d === "easy") return "text-green-600";
    if (d === "medium") return "text-yellow-600";
    if (d === "hard") return "text-red-600";
    return "text-gray-500";
  };

  const handlePersonaChange = (questionId, value) => {
    setSelectedPersonas((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium text-center mb-8">
          Question Selection Interface
        </h1>

        {/* --- Filter Controls --- */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search questions..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-primary"
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="All">All Categories</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Technical">Technical</option>
            <option value="Leadership">Leadership</option>
            <option value="Communication">Communication</option>
            <option value="Cost & Value">Cost & Value</option>
            <option value="Clinical Data & Evidence">
              Clinical Data & Evidence
            </option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-primary"
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
          >
            <option value="All">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* --- Table --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[3fr_1.5fr_1fr_1.5fr_1fr_1fr] text-gray-600 text-sm font-semibold border-b px-6 py-3 bg-gray-100 sticky top-0 z-10">
            <div>Question</div>
            <div>Category</div>
            <div>Difficulty</div>
            <div>Persona</div>
            <div>Est. Time</div>
            <div className="text-center">Action</div>
          </div>

          {/* Body */}
          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading...</p>
            ) : error ? (
              <p className="text-center text-red-500 py-10">{error}</p>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                No questions match your filters.
              </p>
            ) : (
              filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="grid grid-cols-[3fr_1.5fr_1fr_1.5fr_1fr_1fr] items-center px-6 py-4 border-b hover:bg-gray-50 transition-all"
                >
                  {/* Question */}
                  <div>
                    <p className="font-medium text-indigo-800">{q.question}</p>
                    <p className="text-xs text-gray-500">{q.context}</p>
                  </div>

                  {/* Category */}
                  <p className="text-sm text-gray-700">{q.category}</p>

                  {/* Difficulty */}
                  <p
                    className={`text-sm font-semibold ${getDifficultyColor(
                      q.difficulty
                    )}`}
                  >
                    {q.difficulty?.charAt(0).toUpperCase() +
                      q.difficulty?.slice(1)}
                  </p>

                  {/* Persona Dropdown */}
                  <div>
                    {personasByQuestion[q.id] &&
                    personasByQuestion[q.id].length > 0 ? (
                      <select
                        value={
                          selectedPersonas[q.id] || personasByQuestion[q.id][0]
                        }
                        onChange={(e) =>
                          handlePersonaChange(q.id, e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary"
                      >
                        {personasByQuestion[q.id].map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No personas
                      </span>
                    )}
                  </div>

                  {/* Est. Time */}
                  <p className="text-sm text-gray-600 text-center">
                    {q.estimated_response_time || "-"}
                  </p>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <button
                      className="bg-primary hover:bg-indigo text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition-all"
                      onClick={() => handleStartPractice(q)}
                    >
                      Practice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
