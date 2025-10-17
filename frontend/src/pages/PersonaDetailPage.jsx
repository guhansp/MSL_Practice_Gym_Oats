import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import pattern from "../assets/Pattern_Dot.png";
import { getPersonaById } from "../services/personaService";

export default function PersonaDetailPage() {
  const { personaId } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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
      setError(
        err.response?.data?.error || err.message || "Failed to load persona"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Renderers ---
  const renderArrayContent = (items) => {
    if (!items || items.length === 0)
      return <p className="text-graphite text-base">No information available</p>;
    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-grayLight p-4 rounded-lg border border-grayNeutral"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-graphite text-base leading-relaxed flex-1 font-sans">
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderJSONContent = (obj) => {
    if (!obj || typeof obj !== "object")
      return <p className="text-graphite text-base">No information available</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(obj).map(([key, value]) => (
          <div
            key={key}
            className="bg-grayLight p-5 rounded-lg border border-grayNeutral"
          >
            <p className="text-xs text-graphite uppercase tracking-wide mb-2 font-sans font-semibold">
              {key.replace(/_/g, " ")}
            </p>
            <p className="text-primary font-medium text-base font-sans">
              {value}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "communication", label: "Communication Style" },
    { id: "priorities", label: "Priorities & Challenges" },
    { id: "engagement", label: "Engagement Strategies" },
    { id: "questions", label: "Typical Questions" },
  ];

  // --- Loading / Error States ---
  if (loading)
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-graphite font-sans text-base">
              Loading persona details...
            </p>
          </div>
        </div>
      </>
    );

  if (error || !persona)
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-grayAccent flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-white border border-grayNeutral rounded-xl p-6 mb-4">
              <p className="text-primary font-semibold mb-2 text-lg">
                Error Loading Persona
              </p>
              <p className="text-graphite text-base">
                {error || "Persona not found"}
              </p>
            </div>
            <button
              onClick={() => navigate("/personas")}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300"
            >
              Back to Personas
            </button>
          </div>
        </div>
      </>
    );

  // --- Main Content ---
  return (
    <>
      <NavBar />
      <section className="min-h-screen bg-grayAccent px-6 py-10 font-sans">
        {/* Back Button */}
        <button
          onClick={() => navigate("/personas")}
          className="text-primary hover:text-primary/80 mb-6 flex items-center gap-2 font-medium text-base"
        >
          ← Back to All Personas
        </button>

{/* --- Persona Header Section with Background Pattern --- */}
<div
  className="w-full flex justify-center mb-10 py-10"
  style={{
    backgroundImage: `url(${pattern})`,
    backgroundRepeat: "repeat",
    backgroundSize: "contain",
    backgroundPosition: "center",
  }}
>
  <div className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-primary w-full max-w-3xl backdrop-blur-sm bg-white/90">
    <h1 className="text-3xl md:text-3xl font-serif text-indigo font-semibold mb-2">
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
      <span className="bg-grayLight border border-grayNeutral px-4 py-2 rounded-lg text-sm font-medium text-graphite">
        {persona.professional_background?.years_in_practice} Years Experience
      </span>
    </div>

    <div className="border-l-4 border-primary bg-grayLight p-5 rounded-r-lg">
      <p className="text-primary italic font-medium text-base leading-relaxed">
        {persona.quote}
      </p>
    </div>
  </div>
</div>


        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-grayNeutral">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-base font-medium whitespace-nowrap transition-colors duration-300 ${
                    activeTab === tab.id
                      ? "text-primary bg-grayLight"
                      : "text-graphite hover:text-primary hover:bg-grayLight"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 text-base leading-relaxed">
          {activeTab === "overview" && (
            <div className="space-y-10">
              <Section title="Professional Background">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatBox
                    label="Years in Practice"
                    value={persona.professional_background?.years_in_practice}
                  />
                  <CertBox
                    label="Board Certifications"
                    items={
                      persona.professional_background?.board_certifications
                    }
                  />
                  <InfoBox
                    label="Research Involvement"
                    value={
                      persona.professional_background?.research_involvement
                    }
                  />
                  <InfoBox
                    label="Teaching Role"
                    value={persona.professional_background?.teaching_role}
                  />
                </div>
              </Section>

              <Section title="Practice Setting">
                {renderJSONContent(persona.practice_setting)}
              </Section>
              <Section title="Patient Population">
                {renderJSONContent(persona.patient_population)}
              </Section>
              <Section title="Practice Patterns">
                {renderJSONContent(persona.practice_patterns)}
              </Section>
            </div>
          )}

          {activeTab === "communication" && (
            <div className="space-y-10">
              <Section title="Communication Style">
                {renderJSONContent(persona.communication_style)}
              </Section>
              <Section title="Emotional Drivers">
                {renderJSONContent(persona.emotional_drivers)}
              </Section>
              <Section title="Decision Making Factors">
                {renderArrayContent(persona.decision_making_factors)}
              </Section>
            </div>
          )}

          {activeTab === "priorities" && (
            <div className="space-y-10">
              <Section title="Top Priorities">
                {renderArrayContent(persona.priorities)}
              </Section>
              <Section title="Common Challenges">
                {renderArrayContent(persona.common_challenges)}
              </Section>
            </div>
          )}

          {activeTab === "engagement" && (
            <div className="space-y-10">
              <div className="bg-grayLight border-l-4 border-primary p-6 rounded-r-lg">
                <h3 className="font-semibold text-primary mb-2">
                  Effective Engagement Strategies
                </h3>
                <p className="text-graphite text-base">
                  These evidence-based strategies are tailored for{" "}
                  {persona.name}’s communication style, priorities, and
                  preferences.
                </p>
              </div>
              <Section title="Recommended Approaches">
                {renderArrayContent(persona.engagement_tips)}
              </Section>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-10">
              <Section title="Typical Question Patterns">
                <p className="text-graphite mb-4">
                  Common question types and concerns frequently raised by{" "}
                  {persona.name}:
                </p>
                {renderArrayContent(persona.typical_questions)}
              </Section>

              {persona.questions?.length > 0 && (
                <Section title="Available Practice Questions">
                  <p className="text-graphite mb-4">
                    {persona.questions.length} questions available for practice
                  </p>
                  <div className="space-y-4">
                    {persona.questions.map((q) => (
                      <div
                        key={q.id}
                        className="border-l-4 border-primary bg-grayLight p-5 rounded-r-lg hover:shadow-md transition-all duration-300 border border-grayNeutral"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 font-sans">
                              {q.category}
                            </p>
                            <p className="text-primary font-medium mb-3 font-sans">
                              {q.question}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs px-3 py-1 rounded-lg bg-white border border-grayNeutral text-graphite font-sans uppercase">
                                {q.difficulty}
                              </span>
                              {q.estimated_response_time && (
                                <span className="text-xs px-3 py-1 rounded-lg bg-white border border-grayNeutral text-graphite font-sans">
                                  {q.estimated_response_time}s
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              navigate("/questions", {
                                state: {
                                  selectedQuestion: q.id,
                                  selectedPersona: persona.id,
                                },
                              })
                            }
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                          >
                            Start Practice Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* Helper Components (Clean Sans Style, no mono font) */
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-serif text-primary font-semibold mb-6 pb-2 border-b-2 border-primary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg text-center">
      <p className="text-xs text-graphite uppercase tracking-wide mb-1 font-sans font-semibold">
        {label}
      </p>
      <p className="text-primary font-bold text-4xl font-sans leading-tight">
        {value}
      </p>
    </div>
  );
}

function CertBox({ label, items }) {
  return (
    <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg">
      <p className="text-xs text-graphite uppercase tracking-wide mb-2 font-sans font-semibold">
        {label}
      </p>
      <div className="text-primary font-medium space-y-1">
        {items?.map((cert, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
            <p className="text-sm font-sans text-primary">{cert}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-grayLight border border-grayNeutral p-5 rounded-lg">
      <p className="text-xs text-graphite uppercase tracking-wide mb-2 font-sans font-semibold">
        {label}
      </p>
      <p className="text-primary font-medium text-base font-sans">{value}</p>
    </div>
  );
}
