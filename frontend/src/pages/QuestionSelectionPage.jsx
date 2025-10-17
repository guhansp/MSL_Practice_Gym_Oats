import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { fetchQuestions } from "../services/questionService";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function QuestionSelection() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: "All Categories",
    difficulty: "All Difficulties",
    persona: "All Personas",
  });

  const [questions, setQuestions] = useState([]);
  const [personasByQuestion, setPersonasByQuestion] = useState({});
  const [selectedPersonas, setSelectedPersonas] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    difficulties: [],
    personas: [],
  });
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
        const questionData = res.data;
        setQuestions(questionData);

        // Fetch personas for each question
        const personaMap = {};
        const selectionMap = {};
        const personaSet = new Set();

        await Promise.all(
          questionData.map(async (q) => {
            try {
              const resp = await API.get(`/questions/${q.id}/personas`);
              personaMap[q.id] = resp.data.personas || [];
              selectionMap[q.id] = resp.data.personas?.[0] || "—";
              resp.data.personas?.forEach((p) => personaSet.add(p));
            } catch {
              personaMap[q.id] = [];
              selectionMap[q.id] = "—";
            }
          })
        );

        setPersonasByQuestion(personaMap);
        setSelectedPersonas(selectionMap);

        // --- Build dynamic filter options ---
        const categorySet = new Set();
        const difficultySet = new Set();

        questionData.forEach((q) => {
          if (q.category) categorySet.add(q.category);
          if (q.difficulty) difficultySet.add(q.difficulty);
        });

        setFilterOptions({
          categories: ["All Categories", ...Array.from(categorySet)],
          difficulties: ["All Difficulties", ...Array.from(difficultySet)],
          personas: ["All Personas", ...Array.from(personaSet)],
        });
      } catch (err) {
        console.error("Error loading questions:", err);
        setError("Failed to load questions or personas.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // --- Filtered questions ---
  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question?.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory =
      filters.category === "All Categories" || q.category === filters.category;
    const matchDifficulty =
      filters.difficulty === "All Difficulties" || q.difficulty === filters.difficulty;

    const availablePersonas = personasByQuestion[q.id] || [];
    const matchPersona =
      filters.persona === "All Personas" ||
      availablePersonas.includes(filters.persona.toLowerCase()) ||
      availablePersonas.includes(filters.persona);

    return matchSearch && matchCategory && matchDifficulty && matchPersona;
  });

  const getDifficultyColor = (difficulty) => {
    const d = difficulty?.toLowerCase();
    if (d === "easy") return "text-green-600";
    if (d === "medium") return "text-yellow-600";
    if (d === "hard" || d === "high") return "text-red-600";
    return "text-gray-500";
  };

  const handlePersonaChange = (questionId, value) => {
    setSelectedPersonas((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const formatLabel = (str) => {
    if (!str) return str;
    return str
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace("All", "All"); // keeps "All Categories" readable
  };

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium text-center mb-8">
          Questions
        </h1>

        {/* --- Filter Controls --- */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Search */}
          <input
            type="text"
            placeholder="Search questions..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          {/* Category */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-44 focus:ring-2 focus:ring-primary"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            {filterOptions.categories.map((cat) => (
              <option key={cat} value={cat}>
                {formatLabel(cat)}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-primary"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            {filterOptions.difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {formatLabel(diff)}
              </option>
            ))}
          </select>

          {/* Persona */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-44 focus:ring-2 focus:ring-primary"
            value={filters.persona}
            onChange={(e) => setFilters({ ...filters, persona: e.target.value })}
          >
            {filterOptions.personas.map((p) => (
              <option key={p} value={p}>
                {formatLabel(p)}
              </option>
            ))}
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
              filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`grid grid-cols-[3fr_1.5fr_1fr_1.5fr_1fr_1fr] px-6 py-4 border-b hover:bg-gray-50 transition-all items-start ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* Question */}
                  <div className="max-w-[520px] flex flex-col gap-1 mr-10">
                    <p className="font-medium text-indigo-800 leading-snug break-words whitespace-normal">
                      {q.question}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug break-words whitespace-normal">
                      {q.context}
                    </p>
                  </div>

                  {/* Category */}
                  <p className="text-sm text-gray-700">{q.category}</p>

                  {/* Difficulty */}
                  <p className={`text-sm font-semibold ${getDifficultyColor(q.difficulty)}`}>
                    {formatLabel(q.difficulty)}
                  </p>

                  {/* Persona Dropdown */}
                  <div>
                    {personasByQuestion[q.id] && personasByQuestion[q.id].length > 0 ? (
                      <select
                        value={selectedPersonas[q.id] || personasByQuestion[q.id][0]}
                        onChange={(e) => handlePersonaChange(q.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary"
                      >
                        {personasByQuestion[q.id].map((p) => (
                          <option key={p} value={p}>
                            {formatLabel(p)}
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

                  {/* Practice Button */}
                  <div className="flex justify-center items-center">
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
