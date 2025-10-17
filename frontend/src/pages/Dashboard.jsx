import React from "react";
import NavBar from "../components/NavBar";

// Mock data for demonstration
export default function Dashboard() {
  const userName = "Thejus"; // Replace dynamically from auth context later

  const scores = [
    { id: 1, title: "Presentation Skills", score: 45, color: "bg-red-100 text-red-700" },
    { id: 2, title: "Scientific Writing", score: 65, color: "bg-yellow-100 text-yellow-700" },
    { id: 3, title: "Team Communication", score: 80, color: "bg-green-100 text-green-700" },
    { id: 4, title: "Confidence in Meetings", score: 72, color: "bg-yellow-100 text-yellow-700" },
    { id: 5, title: "Public Speaking", score: 90, color: "bg-green-100 text-green-700" },
  ];

  // Simulated 30-day streak data
  const streakData = Array.from({ length: 30 }, () =>
    Math.random() > 0.4 ? 1 : 0
  );

  const sessionsCompleted = streakData.filter((d) => d === 1).length;
  const longestStreak = Math.max(
    ...streakData
      .join("")
      .split("0")
      .map((s) => s.length)
  );

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        {/* --- Header --- */}
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium mb-8">
          Welcome, <span className="text-primary">{userName}</span>
        </h1>

        {/* --- Confidence Score Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {scores.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-6 shadow-md ${item.color} flex flex-col justify-between transition-transform hover:-translate-y-1`}
            >
              <div>
                <h2 className="text-lg font-medium mb-2">{item.title}</h2>
                <p className="text-4xl font-bold">{item.score}%</p>
              </div>
              <button className="mt-4 bg-primary hover:bg-indigo text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300">
                Practice Now
              </button>
            </div>
          ))}
        </div>

        {/* --- Streak + Heatmap Section --- */}
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 max-w-5xl mx-auto">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-4">
            Your Consistency Streak
          </h2>
          <p className="text-graphite mb-6">
            You’ve completed{" "}
            <span className="font-semibold text-primary">{sessionsCompleted}</span>{" "}
            sessions this month. Your longest streak is{" "}
            <span className="font-semibold text-primary">{longestStreak}</span>{" "}
            days in a row. Keep it up!
          </p>

          {/* --- Heatmap --- */}
          <div className="flex flex-wrap gap-1">
            {streakData.map((day, i) => (
              <div
                key={i}
                className={`h-4 w-4 sm:h-5 sm:w-5 rounded-sm ${
                  day ? "bg-primary" : "bg-grayNeutral"
                } transition-all duration-300 hover:scale-110`}
                title={`Day ${i + 1}: ${day ? "Completed" : "Missed"}`}
              ></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
