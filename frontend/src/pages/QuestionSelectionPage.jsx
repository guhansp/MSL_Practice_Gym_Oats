import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { fetchQuestions } from "../services/questionService";

export default function QuestionSelection() {
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    difficulty: "All",
    persona: "All",
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetchQuestions();
        setQuestions(res.data);
      } catch {
        setError("Failed to load questions from the server.");
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question
      ?.toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchCategory =
      filters.category === "All" || q.category === filters.category;
    const matchDifficulty =
      filters.difficulty === "All" || q.difficulty === filters.difficulty;
    const matchPersona =
      filters.persona === "All" ||
      (q.persona && q.persona === filters.persona);
    return matchSearch && matchCategory && matchDifficulty && matchPersona;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600";
      case "Medium":
        return "text-yellow-600";
      case "High":
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const formatDifficulty = (difficulty) => {
    if (!difficulty) return "-";
    const d = difficulty.toLowerCase();
    if (d === "hard" || d === "high") return "High";
    if (d === "medium") return "Medium";
    if (d === "easy") return "Easy";
    return difficulty;
  };

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium text-center mb-8">
          Question Selection Interface
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search questions..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-primary"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="All">All Categories</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Technical">Technical</option>
            <option value="Leadership">Leadership</option>
            <option value="Communication">Communication</option>
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
            <option value="High">High</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-primary"
            onChange={(e) => setFilters({ ...filters, persona: e.target.value })}
          >
            <option value="All">All Personas</option>
            <option value="General">General</option>
            <option value="Team Player">Team Player</option>
            <option value="Leader">Leader</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 sticky top-0 z-10 text-gray-600 font-semibold">
                <tr>
                  <th className="text-left px-6 py-3 w-[40%]">Question</th>
                  <th className="text-left px-4 py-3 w-[15%]">Category</th>
                  <th className="text-center px-4 py-3 w-[10%]">Difficulty</th>
                  <th className="text-center px-4 py-3 w-[10%]">Persona</th>
                  <th className="text-center px-4 py-3 w-[10%]">Est. Time</th>
                  <th className="text-right px-6 py-3 w-[10%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No questions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b hover:bg-gray-50 transition"
                      onClick={() => alert(`Start practice: ${q.question}`)}
                    >
                      <td className="px-6 py-4 align-top">
                        <p className="font-medium text-indigo-800 break-words">
                          {q.question}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{q.context}</p>
                      </td>
                      <td className="px-4 py-4 max-w-[100px] truncate">
                        {q.category || "—"}
                      </td>
                      <td
                        className={`px-4 py-4 text-center font-semibold ${getDifficultyColor(
                          q.difficulty
                        )}`}
                      >
                        {formatDifficulty(q.difficulty)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {q.persona || "—"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {q.estimated_response_time || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary font-medium hover:underline text-sm">
                          Practice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
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
                className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition-all"
              >
                <p className="font-medium text-indigo-800">{q.question}</p>
                <p className="text-xs text-gray-500 mt-1">{q.context}</p>

                <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600">
                  <span>
                    <strong>Category:</strong> {q.category || "—"}
                  </span>
                  <span>
                    <strong>Difficulty:</strong>{" "}
                    <span className={`${getDifficultyColor(q.difficulty)}`}>
                      {formatDifficulty(q.difficulty)}
                    </span>
                  </span>
                  <span>
                    <strong>Persona:</strong> {q.persona || "—"}
                  </span>
                  <span>
                    <strong>Est. Time:</strong> {q.estimated_response_time || "-"}
                  </span>
                </div>

                <button className="mt-4 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo transition">
                  Practice Now
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
