import React, { useState } from "react";
import NavBar from "../components/NavBar";

export default function QuestionSelection() {
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    difficulty: "All",
    persona: "All",
  });

  const questions = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1}: Describe a scenario you managed effectively.`,
    category: i % 2 === 0 ? "Behavioral" : "Technical",
    difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard",
    persona: i % 2 === 0 ? "Leader" : "General",
    context: "This question assesses your ability to communicate under real-world conditions.",
    estimatedTime: `${2 + (i % 3)} min`,
  }));

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = filters.category === "All" || q.category === filters.category;
    const matchDifficulty = filters.difficulty === "All" || q.difficulty === filters.difficulty;
    const matchPersona = filters.persona === "All" || q.persona === filters.persona;
    return matchSearch && matchCategory && matchDifficulty && matchPersona;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600";
      case "Medium":
        return "text-yellow-600";
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium text-center mb-8">
          Question Selection Interface
        </h1>

        {/* Filter Controls */}
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
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="All">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
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

        {/* Scrollable Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-6 text-gray-600 text-sm font-semibold border-b px-6 py-3 bg-gray-100 sticky top-0 z-10">
            <div className="col-span-2">Question</div>
            <div>Category</div>
            <div>Difficulty</div>
            <div>Persona</div>
            <div>Est. Time</div>
          </div>

          {/* Scrollable Body */}
          <div className="max-h-[480px] overflow-y-auto">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="grid grid-cols-6 items-center px-6 py-4 border-b hover:bg-gray-50 transition-all cursor-pointer"
                onClick={() => alert(`Start practice: ${q.question}`)}
              >
                <div className="col-span-2">
                  <p className="font-medium text-indigo-800">{q.question}</p>
                  <p className="text-xs text-gray-500">{q.context}</p>
                </div>

                <p className="text-sm text-gray-700">{q.category}</p>

                <p className={`text-sm font-semibold ${getDifficultyColor(q.difficulty)}`}>
                  {q.difficulty}
                </p>

                <p className="text-sm text-gray-600">{q.persona}</p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{q.estimatedTime}</p>
                  <button className="text-primary font-medium hover:underline text-sm">
                    Practice
                  </button>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                No questions match your filters.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
