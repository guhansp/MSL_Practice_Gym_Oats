// pages/PersonaDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { getPersonaById } from '../services/personaService';

export default function PersonaDetailPage() {
  const { personaId } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPersonaDetails();
  }, [personaId]);

  const fetchPersonaDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPersonaById(personaId);
      setPersona(data.persona);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load persona');
    } finally {
      setLoading(false);
    }
  };

  const renderArrayContent = (items) => {
    if (!items || items.length === 0) {
      return <p className="text-graphite">No information available</p>;
    }
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 bg-grayLight p-4 rounded-lg border border-grayNeutral">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-graphite text-sm flex-1">{item}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderJSONContent = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return <p className="text-graphite">No information available</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="bg-grayLight p-4 rounded-lg border border-grayNeutral">
            <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
              {key.replace(/_/g, ' ')}
            </p>
            <p className="text-primary font-medium text-sm">{value}</p>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'communication', label: 'Communication Style' },
    { id: 'priorities', label: 'Priorities & Challenges' },
    { id: 'engagement', label: 'Engagement Strategies' },
    { id: 'questions', label: 'Typical Questions' },
  ];

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-graphite font-sans">Loading persona details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !persona) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-white border border-grayNeutral rounded-xl p-6 mb-4">
              <p className="text-primary font-medium mb-2">Error Loading Persona</p>
              <p className="text-graphite text-sm">{error || 'Persona not found'}</p>
            </div>
            <button
              onClick={() => navigate('/personas')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Back to Personas
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
        {/* Back Button */}
        <button
          onClick={() => navigate('/personas')}
          className="text-primary hover:text-primary/80 mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          ← Back to All Personas
        </button>

        {/* --- Header --- */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border-t-4 border-primary">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary font-medium mb-2">
              {persona.name}
            </h1>
            <p className="text-lg text-graphite mb-4">{persona.title}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-grayLight border border-primary px-4 py-2 rounded-lg text-sm font-medium text-primary">
                {persona.specialty}
              </span>
              <span className="bg-grayLight border border-grayNeutral px-4 py-2 rounded-lg text-sm font-medium text-graphite">
                {persona.subspecialty}
              </span>
              <span className="bg-grayLight border border-grayNeutral px-4 py-2 rounded-lg text-sm font-medium text-graphite font-mono">
                {persona.professional_background?.years_in_practice} Years Experience
              </span>
            </div>

            {/* Quote */}
            <div className="border-l-4 border-primary bg-grayLight p-5 rounded-r-lg">
              <p className="text-primary italic font-medium">{persona.quote}</p>
            </div>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-grayNeutral">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-all duration-300 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-grayLight'
                      : 'border-transparent text-graphite hover:text-primary hover:bg-grayLight'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Content --- */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Professional Background
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Years in Practice
                    </p>
                    <p className="text-primary font-bold text-3xl font-mono">
                      {persona.professional_background?.years_in_practice}
                    </p>
                  </div>
                  <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Board Certifications
                    </p>
                    <div className="text-primary font-medium space-y-1">
                      {persona.professional_background?.board_certifications?.map((cert, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                          <p className="text-sm">{cert}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Research Involvement
                    </p>
                    <p className="text-primary font-medium text-sm">
                      {persona.professional_background?.research_involvement}
                    </p>
                  </div>
                  <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg">
                    <p className="text-xs text-graphite font-medium font-mono uppercase tracking-wide mb-2">
                      Teaching Role
                    </p>
                    <p className="text-primary font-medium text-sm">
                      {persona.professional_background?.teaching_role}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Practice Setting
                </h3>
                {renderJSONContent(persona.practice_setting)}
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Patient Population
                </h3>
                {renderJSONContent(persona.patient_population)}
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Practice Patterns
                </h3>
                {renderJSONContent(persona.practice_patterns)}
              </div>
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Communication Style
                </h3>
                {renderJSONContent(persona.communication_style)}
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Emotional Drivers
                </h3>
                {renderJSONContent(persona.emotional_drivers)}
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Decision Making Factors
                </h3>
                {renderArrayContent(persona.decision_making_factors)}
              </div>
            </div>
          )}

          {/* Priorities Tab */}
          {activeTab === 'priorities' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Top Priorities
                </h3>
                {renderArrayContent(persona.priorities)}
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Common Challenges
                </h3>
                {renderArrayContent(persona.common_challenges)}
              </div>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div className="bg-grayLight border-l-4 border-primary p-6 rounded-r-lg">
                <h3 className="font-medium text-primary mb-2">
                  Effective Engagement Strategies
                </h3>
                <p className="text-graphite text-sm">
                  These evidence-based strategies are tailored specifically for {persona.name}'s 
                  communication style, priorities, and decision-making preferences.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Recommended Approaches
                </h3>
                {renderArrayContent(persona.engagement_tips)}
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                  Typical Question Patterns
                </h3>
                <p className="text-graphite text-sm mb-4">
                  Common question types and concerns frequently raised by {persona.name}:
                </p>
                {renderArrayContent(persona.typical_questions)}
              </div>

              {persona.questions && persona.questions.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif text-primary font-medium mb-6 pb-2 border-b-2 border-primary">
                    Available Practice Questions
                  </h3>
                  <p className="text-graphite text-sm mb-4 font-mono">
                    {persona.questions.length} questions available for practice with this persona
                  </p>
                  <div className="space-y-4">
                    {persona.questions.map((question) => (
                      <div
                        key={question.id}
                        className="border-l-4 border-primary bg-grayLight p-5 rounded-r-lg hover:shadow-md transition-all duration-300 border border-grayNeutral"
                      >
                        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-primary font-mono uppercase tracking-wide mb-2">
                              {question.category}
                            </p>
                            <p className="text-primary font-medium mb-3">
                              {question.question}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs px-3 py-1 rounded-lg bg-white border border-grayNeutral text-graphite font-medium font-mono uppercase">
                                {question.difficulty}
                              </span>
                              {question.estimated_response_time && (
                                <span className="text-xs px-3 py-1 rounded-lg bg-white border border-grayNeutral text-graphite font-mono">
                                  {question.estimated_response_time}s
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('/questions', { 
                              state: { 
                                selectedQuestion: question.id,
                                selectedPersona: persona.id
                              } 
                            })}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors duration-300 w-full sm:w-auto"
                          >
                            Start Practice Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}