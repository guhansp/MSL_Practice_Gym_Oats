import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchUserDashboard } from "../services/dashboardService";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = "Ashmiya"; // later replace with decoded user name from JWT

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchUserDashboard();
        setDashboardData(res.progress);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const getColorClass = (score) => {
    if (score < 50) return "text-red-600";
    if (score < 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getChipColor = (score) => {
    if (score < 50) return "bg-red-100 text-red-700";
    if (score < 75) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  // Placeholder if API hasn’t returned yet
  const scores =
    dashboardData?.scores || [
      { id: 1, title: "Presentation Skills", score: 45 },
      { id: 2, title: "Scientific Writing", score: 65 },
      { id: 3, title: "Team Communication", score: 80 },
      { id: 4, title: "Confidence in Meetings", score: 72 },
      { id: 5, title: "Public Speaking", score: 90 },
    ];

  const totalSessions = dashboardData?.total_sessions || 42;
  const totalMinutes = dashboardData?.total_minutes || 560;
  const currentStreak = dashboardData?.streak || 7;

  const confidenceData =
    dashboardData?.confidence_data || [
      { name: "Presentation", value: 45, color: "#0077E6" },
      { name: "Writing", value: 65, color: "#00AEEF" },
      { name: "Communication", value: 80, color: "#1B004B" },
      { name: "Meetings", value: 72, color: "#404A69" },
      { name: "Public Speaking", value: 90, color: "#5AC8FA" },
    ];

  const recentSessions =
    dashboardData?.recent_sessions || [
      { date: "Oct 14, 2025", topic: "Scientific Writing", score: 75 },
      { date: "Oct 13, 2025", topic: "Presentation Skills", score: 82 },
      { date: "Oct 12, 2025", topic: "Confidence in Meetings", score: 65 },
      { date: "Oct 10, 2025", topic: "Public Speaking", score: 88 },
      { date: "Oct 9, 2025", topic: "Team Communication", score: 71 },
    ];

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Loading your dashboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">
        {error}
      </div>
    );

  return (
    <>
      <NavBar />
      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium mb-10">
          Welcome, <span className="text-primary">{userName}</span>
        </h1>

        {/* --- Summary Metrics --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <MetricCard title="Total Sessions Completed" value={totalSessions} color="text-primary" />
          <MetricCard
            title="Practice Time Logged"
            value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
            color="text-indigo"
          />
          <MetricCard
            title="Current Streak"
            value={`${currentStreak} Days 🔥`}
            color="text-green-600"
          />
        </div>

        {/* --- Explore Personas CTA --- */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/personas')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium px-8 py-4 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👨‍⚕️</span>
            <span className="font-serif text-lg">Explore Physician Personas</span>
            <span>→</span>
          </button>
        </div>

        {/* --- Confidence Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {scores.map((item) => {
            const label =
              item.score < 50 ? "Low" : item.score < 75 ? "Medium" : "High";
            return (
              <div
                key={item.id}
                className="rounded-xl p-6 shadow-md bg-white flex flex-col justify-between transition-transform hover:-translate-y-1"
              >
                <div className="flex justify-end mb-2">
                  <div
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getChipColor(
                      item.score
                    )}`}
                  >
                    {label}
                  </div>
                </div>
                <h2 className="text-lg font-medium text-indigo mb-2">
                  {item.title}
                </h2>
                <p className="text-sm font-bold">
                  Confidence Score:{" "}
                  <span className={`text-base ${getColorClass(item.score)}`}>
                    {item.score}%
                  </span>
                </p>
                <button className="mt-5 bg-primary hover:bg-indigo text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-300">
                  Practice Now
                </button>
              </div>
            );
          })}
        </div>

        {/* --- Confidence by Category Chart --- */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-6">
            Confidence by Category
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="50%"
                  outerRadius="80%"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    color: "#1B004B",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Streak Heatmap --- */}
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 max-w-5xl mx-auto mb-10">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-4">
            Your Consistency Streak
          </h2>
          <p className="text-graphite mb-6">
            You've completed{" "}
            <span className="font-semibold text-primary">
              {sessionsCompleted}
            </span>{" "}
            sessions this month. Longest streak:{" "}
            <span className="font-semibold text-primary">{longestStreak}</span>{" "}
            days in a row.
          </p>
          <div className="flex flex-wrap gap-1">
            {streakData.map((day, i) => (
              <div
                key={i}
                className={`h-4 w-4 sm:h-5 sm:w-5 rounded-sm ${
                  day ? "bg-primary" : "bg-grayNeutral"
                } transition-all duration-300 hover:scale-110`}
                title={`Day ${i + 1}: ${day ? "Practiced" : "Missed"}`}
              ></div>
            ))}
          </div>
        </div>

        {/* --- Recent Sessions --- */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 max-w-5xl mx-auto">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-6">
            Recent Session History
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="pb-3 text-sm font-medium">Date</th>
                <th className="pb-3 text-sm font-medium">Topic</th>
                <th className="pb-3 text-sm font-medium">Confidence Score</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="py-3 text-sm">{session.date}</td>
                  <td className="py-3 text-sm">{session.topic}</td>
                  <td className="py-3 text-sm font-semibold text-indigo">
                    {session.score}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// Small reusable component for cleaner layout
function MetricCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <h3 className="text-sm text-graphite mb-2 font-medium">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
