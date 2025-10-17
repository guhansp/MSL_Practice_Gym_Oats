// pages/PersonasPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getAllPersonas } from '../services/api';

export default function PersonasPage() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPersonas();
      setPersonas(data.personas || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-graphite font-sans">Loading personas...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-white border border-grayNeutral rounded-xl p-6 mb-4">
              <p className="text-primary font-medium mb-2">Error Loading Personas</p>
              <p className="text-graphite text-sm">{error}</p>
            </div>
            <button
              onClick={fetchPersonas}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        {/* --- Header --- */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-serif text-primary font-medium mb-3">
            Physician Personas
          </h1>
          <p className="text-graphite text-sm md:text-base">
            Understand different physician types and develop effective engagement strategies
          </p>
        </div>

        {/* --- Info Banner --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10 border-l-4 border-primary">
          <div>
            <h3 className="font-medium text-primary mb-2">Understanding Physician Personas</h3>
            <p className="text-graphite text-sm">
              Each physician type has distinct priorities, communication preferences, and decision-making factors. 
              Mastering these personas enables you to tailor your approach and communicate more effectively in 
              high-stakes conversations. Select a persona below to explore detailed insights and engagement strategies.
            </p>
          </div>
        </div>

        {/* --- Personas Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => navigate(`/personas/${persona.id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border border-grayNeutral hover:border-primary"
            >
              {/* Header - Primary Blue */}
              <div className="bg-primary p-6 text-white">
                <h3 className="text-xl font-serif font-medium mb-1">{persona.name}</h3>
                <p className="text-sm opacity-90">{persona.title}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    {persona.specialty}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    {persona.professional_background?.years_in_practice} years
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Practice Setting */}
                <div className="mb-4">
                  <p className="text-xs text-graphite font-medium mb-1 font-mono uppercase tracking-wide">
                    Practice Setting
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {persona.practice_setting?.type}
                  </p>
                  <p className="text-xs text-graphite mt-1">
                    {persona.practice_setting?.location}
                  </p>
                </div>

                {/* Quote */}
                <div className="border-l-4 border-primary pl-4 mb-4 bg-grayLight p-3 rounded-r-lg">
                  <p className="text-sm italic text-graphite">
                    {persona.quote}
                  </p>
                </div>

                {/* Communication Style */}
                <div className="mb-6">
                  <p className="text-xs text-graphite font-medium mb-1 font-mono uppercase tracking-wide">
                    Communication Style
                  </p>
                  <p className="text-sm text-primary">
                    {persona.communication_style?.tone}
                  </p>
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/personas/${persona.id}`);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Personas */}
        {personas.length === 0 && !loading && !error && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-graphite text-lg">No personas available</p>
          </div>
        )}
      </section>
    </>
  );
}