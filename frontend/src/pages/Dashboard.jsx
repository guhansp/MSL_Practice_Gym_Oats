import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import NavBar from "../components/NavBar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Rectangle,
} from "recharts";
import { Flame } from "lucide-react";
import { fetchUserDashboard, fetchUserSessions } from "../services/dashboardService";

export default function Dashboard() {
  const navigate = useNavigate(); 
  const [dashboardData, setDashboardData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  
  const [timeRange, setTimeRange] = useState("1m");
  const [selectedCategory, setSelectedCategory] = useState("");



  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchUserDashboard();
        setDashboardData(res.progress); 
            
        setUserName(res.progress.first_name+" "+res.progress.last_name);
        const [dashboardRes, sessionsRes] = await Promise.all([
          fetchUserDashboard(),
          fetchUserSessions(),
        ]);

        setDashboardData(dashboardRes.progress);
        setRecentSessions(sessionsRes);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const getColorForConfidence = (value) => {
    if (value === 0) return "bg-gray-200";
    if (value <= 1) return "bg-blue-200";
    if (value <= 2) return "bg-blue-300";
    if (value <= 3) return "bg-blue-400";
    if (value <= 4) return "bg-blue-500";
    return "bg-blue-700";
  };

  const totalSessions = dashboardData?.total_sessions || 0;
  const totalSeconds = dashboardData?.total_practice_time_seconds || 0;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const currentStreak = dashboardData?.current_streak_days || 0;

  // Persona Cards
  const scores = dashboardData?.persona_stats
    ? Object.entries(dashboardData.persona_stats).map(([persona, stats], i) => ({
        id: i + 1,
        title: persona.charAt(0).toUpperCase() + persona.slice(1),
        score: Math.round((stats.avg_confidence / 5) * 100),
        sessions: stats.count,
      }))
    : [];

  // Category Pie Chart
  const confidenceData = dashboardData?.category_stats
    ? Object.entries(dashboardData.category_stats).map(([category, stats], i) => ({
        name: category,
        value: Math.round((stats.avg_confidence / 5) * 100),
        color: ["#1B004B", "#0077E6", "#00AEEF", "#404A69", "#5AC8FA"][i % 5],
      }))
    : [];

  // Confidence Trend
  const confidenceTrend = dashboardData?.confidence_trend || [];
  const formattedTrend = confidenceTrend.map((t) => ({
    date: new Date(t.date),
    confidence: t.avg_confidence,
  }));

  // Build heatmap grid
  const buildHeatmapGrid = () => {
    const today = new Date();
    const cutoff = new Date(today);
    if (timeRange === "3m") cutoff.setMonth(today.getMonth() - 3);
    else if (timeRange === "6m") cutoff.setMonth(today.getMonth() - 6);
    else cutoff.setMonth(today.getMonth() - 1);

    const allDays = [];
    for (let d = new Date(cutoff); d <= today; d.setDate(d.getDate() + 1)) {
      const found = formattedTrend.find(
        (x) => new Date(x.date).toDateString() === d.toDateString()
      );
      allDays.push({
        date: new Date(d),
        confidence: found ? found.confidence : 0,
      });
    }

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      const slice = allDays.slice(i, i + 7);
      while (slice.length < 7)
        slice.unshift({ confidence: 0, date: new Date(slice[0]?.date || today) });
      weeks.push(slice);
    }
    return weeks;
  };

  const heatmapWeeks = buildHeatmapGrid();

  const getMonthLabels = () => {
    if (!heatmapWeeks.length) return [];
    const months = [];
    const firstDate = heatmapWeeks[0][0].date;
    const lastDate = heatmapWeeks[heatmapWeeks.length - 1].slice(-1)[0].date;
    const cursor = new Date(firstDate);
    while (cursor <= lastDate) {
      months.push({
        label: cursor.toLocaleString("en-US", { month: "short" }),
        start: new Date(cursor),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  };

  const monthLabels = getMonthLabels();

  // Category dropdown for heatmap
  const allCategories = [...new Set(confidenceTrend.map((item) => item.category))];
  useEffect(() => {
    if (!selectedCategory && allCategories.length > 0) {
      setSelectedCategory(allCategories[0]);
    }
  }, [allCategories, selectedCategory]);

  const categoryTrend =
    confidenceTrend.filter((c) => c.category === selectedCategory) || [];

  const categoryHeatmapData = categoryTrend.map((t) => ({
    date: new Date(t.date).toLocaleDateString(),
    confidence: t.avg_confidence,
  }));

  // Performance Comparison
  const performanceComparison = scores.map((s) => ({
    persona: s.title,
    confidence: s.score / 20, // Convert back to 0–5 scale
    sessions: s.sessions,
  }));

  // Goal tracking
  const avgConfidence =
    formattedTrend.reduce((a, b) => a + b.confidence, 0) /
      (formattedTrend.length || 1) || 0;
  const goalProgress = Math.min(Math.round((avgConfidence / 5) * 100), 100);
  const goalTarget = 80;
  const goalAchieved = goalProgress >= goalTarget;

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

      <section className="min-h-screen bg-grayAccent px-6 md:px-10 py-10 font-sans">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-serif text-indigo font-medium mb-10">
          Welcome, <span className="text-primary">{userName}</span>
        </h1>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <MetricCard title="Total Sessions Completed" value={totalSessions} color="text-primary" />
          <MetricCard
            title="Practice Time Logged"
            value={`${totalHours}h ${remainingMinutes}m`}
            color="text-indigo"
          />
          <MetricCard
            title="Current Streak"
            value={
              <span className="flex items-center justify-center gap-2">
                {currentStreak} Days <Flame className="h-6 w-6 text-orange-500" />
              </span>
            }
            color="text-green-600"
          />
        </div>

        {/* Persona Scores */}
        {/* --- Explore Personas CTA --- */}
        <div className="mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h3 className="font-serif text-lg sm:text-xl text-primary font-medium mb-2">
                  Ready to Learn Physician Communication Styles?
                </h3>
                <p className="text-graphite text-xs sm:text-sm">
                  Master the communication styles and priorities of oncologists, cardiologists, and neurologists
                </p>
              </div>
              <button
                onClick={() => navigate('/personas')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300 whitespace-nowrap"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>

        {/* --- Confidence Cards --- */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12"/> */}
        {/* --- Persona Scores (Full Row Stretch) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6 mb-12 w-full">
          {scores.map((item) => {
            const label =
              item.score < 50 ? "Low" : item.score < 75 ? "Medium" : "High";
            return (
              <div
                key={item.id}
                className="w-full rounded-xl p-6 shadow-md bg-white flex flex-col justify-between hover:-translate-y-1 transition-transform"
              >
                <div className="flex justify-end mb-2">
                  <div
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.score < 50
                        ? "bg-red-100 text-red-700"
                        : item.score < 75
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {label}
                  </div>
                </div>
                <h2 className="text-lg font-medium text-indigo mb-2">{item.title}</h2>
                <p className="text-sm font-bold">
                  Confidence Score:{" "}
                  <span
                    className={`text-base ${
                      item.score < 50
                        ? "text-red-600"
                        : item.score < 75
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {(item.score / 20).toFixed(1)} / 5
                  </span>
                </p>
                <p className="text-xs text-gray-500 mb-3">Sessions: {item.sessions}</p>
                <button className="mt-auto bg-primary hover:bg-indigo text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                  Practice Now
                </button>
              </div>
            );
          })}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10 w-full">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-6">
            Confidence by Category
          </h2>
          <div className="h-80">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Trend */}
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 w-full mb-10">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium">
              Confidence Trend (0–5 Scale)
            </h2>
            <div className="flex gap-3">
              {["1m", "3m", "6m"].map((range) => (
                <button
                  key={range}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium border ${
                    timeRange === range
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-graphite border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range === "1m"
                    ? "This Month"
                    : range === "3m"
                    ? "Last 3 Months"
                    : "Last 6 Months"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-start gap-[3px] mb-2 text-xs text-gray-500 w-full pl-6">
              {monthLabels.map((m) => (
                <div key={m.label} className="w-[56px] text-center">
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex overflow-x-auto gap-[3px] justify-center pb-4">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`h-4 w-4 sm:h-5 sm:w-5 rounded-sm ${getColorForConfidence(
                        day.confidence
                      )}`}
                      title={`${day.date.toLocaleDateString()}: ${day.confidence?.toFixed(
                        1
                      )}/5`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Strength Heatmap (Dropdown + Bars) */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10 w-full">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium">
              Category Strength Heatmap
            </h2>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {categoryHeatmapData.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No data available for this category.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryHeatmapData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tickCount={6} />
                  <Tooltip />
                  <Bar
                    dataKey="confidence"
                    shape={(props) => {
                      const { x, y, width, height, payload } = props;
                      const shades = [
                        "#E0ECFF",
                        "#A8D0FF",
                        "#72B6FF",
                        "#3C9DFF",
                        "#0077E6",
                        "#005BB5",
                      ];
                      const shade = shades[Math.round(payload.confidence)] || "#E0ECFF";
                      return (
                        <Rectangle
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={shade}
                          radius={[2, 2, 0, 0]}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Performance Comparison (Composite Chart 0–5 Scale) */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10 w-full">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-6">
            Performance Comparison
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={performanceComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="persona" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" orientation="left" label={{ value: "Sessions", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} label={{ value: "Confidence (0–5)", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sessions" fill="#5AC8FA" barSize={40} name="Sessions" />
              <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#0077E6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Confidence (0–5)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Achievement */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-16 w-full text-center">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-6">
            Goal Achievement Tracking
          </h2>
          <div className="w-full max-w-lg mx-auto">
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={`h-6 rounded-full transition-all duration-500 ${
                  goalAchieved ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Progress: <span className="font-semibold">{goalProgress}%</span> of target{" "}
              <span className="font-semibold">{goalTarget}%</span>
            </p>
            <p
              className={`mt-2 font-semibold ${
                goalAchieved ? "text-green-600" : "text-indigo"
              }`}
            >
              {goalAchieved ? "🎯 Goal Achieved!" : "Keep going — you're almost there!"}
            </p>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 w-full mb-16">
          <h2 className="font-serif text-xl md:text-2xl text-indigo font-medium mb-6">
            Recent Session History
          </h2>

          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No sessions yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="pb-3 text-sm font-medium">Date</th>
                  <th className="pb-3 text-sm font-medium">Persona</th>
                  <th className="pb-3 text-sm font-medium">Category</th>
                  <th className="pb-3 text-sm font-medium">Confidence</th>
                  <th className="pb-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="py-3 text-sm">
                      {new Date(s.started_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm">{s.persona_name}</td>
                    <td className="py-3 text-sm">{s.category}</td>
                    <td className="py-3 text-sm text-indigo font-semibold">
                      {s.confidence_rating ? `${s.confidence_rating}/5` : "—"}
                    </td>
                    <td
                      className={`py-3 text-sm font-medium ${
                        s.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {s.status === "completed" ? "Completed" : "In Progress"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}

// Metric Card Component
function MetricCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <h3 className="text-sm text-graphite mb-2 font-medium">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
