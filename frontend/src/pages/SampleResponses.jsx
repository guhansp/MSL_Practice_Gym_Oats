import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardCheck,
  FileText,
} from "lucide-react";

export default function SampleResponses() {
  const [selectedCategory, setSelectedCategory] = useState("Clinical Data & Evidence");
  const [selectedPersona, setSelectedPersona] = useState("Dr. Sarah Chen");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = [
    "Cost & Value",
    "Clinical Data & Evidence",
    "Patient Acceptance & Treatment Burden",
    "Clinical Decision-Making & Time Constraints",
    "Data Validity & Study Design",
    "Treatment Practicality",
    "Skepticism & Pushback",
  ];

  const personas = [
    "Dr. Sarah Chen",
    "Dr. Michael Torres",
    "Dr. Jennifer Williams",
  ];

  const sampleResponses = [
    {
      category: "Clinical Data & Evidence",
      persona: "Dr. Sarah Chen",
      title: "Your trial excluded elderly patients. How do I know this works for my population?",
      response: `That’s an excellent question, Dr. Chen. While the pivotal study primarily enrolled adults aged 18–75, we conducted a subgroup analysis including patients above 70. The efficacy trend was consistent, and safety outcomes remained stable. Additionally, we’re collaborating on a real-world evidence registry that includes older adults, and I’d be happy to share early data when available.`,
      keyPoints: [
        "Addresses data gap transparently",
        "References subgroup and real-world data",
        "Positions self as ongoing scientific partner",
      ],
      framework: "STAR",
    },
    {
      category: "Cost & Value",
      persona: "Dr. Michael Torres",
      title: "Why is this therapy so expensive compared to existing treatments?",
      response: `That’s a valid concern, Dr. Torres. The initial cost is higher, but the total value emerges when considering reduced hospitalizations and improved adherence. Health economic analyses show a 22% reduction in overall cost of care within 12 months due to fewer readmissions and better quality-of-life outcomes.`,
      keyPoints: [
        "Acknowledges cost concern empathetically",
        "Reframes discussion in value-based terms",
        "Uses quantitative support",
      ],
      framework: "CAR",
    },
  ];

  const filteredResponses = sampleResponses.filter(
    (r) => r.category === selectedCategory && r.persona === selectedPersona
  );

  return (
    <>
      <NavBar />
      <section className="min-h-screen bg-grayAccent px-6 md:px-10 py-10 font-sans">
        {/* Header */}
        <h1 className="text-3xl md:text-[32px] font-serif text-indigo mb-8 leading-tight">
          Sample Responses
        </h1>
        <p className="text-graphite text-[15px] md:text-base mb-10 max-w-2xl leading-relaxed">
          Access expert-crafted MSL response examples, review key talking points,
          and study structured frameworks to compare your approach with
          communication best practices.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div>
            <label className="text-sm text-indigo font-medium mr-2">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-grayNeutral rounded-md px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-indigo font-medium mr-2">Persona:</label>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="border border-grayNeutral rounded-md px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {personas.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Response Cards */}
        {filteredResponses.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            No sample responses available yet for this selection.
          </p>
        ) : (
          filteredResponses.map((res, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-sm mb-6 border border-grayNeutral transition-all duration-200"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === idx ? null : idx)
                }
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <div>
                  <h2 className="text-lg font-serif text-primary leading-snug">
                    {res.title}
                  </h2>
                  <p className="text-xs text-graphite mt-1">
                    {res.category} · {res.persona}
                  </p>
                </div>
                {expandedIndex === idx ? (
                  <ChevronUp className="text-primary" />
                ) : (
                  <ChevronDown className="text-primary" />
                )}
              </button>

              {expandedIndex === idx && (
                <div className="px-6 pb-6 pt-2 border-t border-grayNeutral">
                  <div className="flex items-center gap-2 mb-3 text-primary font-medium text-sm">
                    <Sparkles className="h-4 w-4" /> Expert Sample
                  </div>
                  <p className="text-sm text-indigo leading-relaxed mb-4">
                    {res.response}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1 text-primary font-medium text-sm">
                      <ClipboardCheck className="h-4 w-4" /> Key Talking Points
                    </div>
                    <ul className="list-disc list-inside text-sm text-graphite">
                      {res.keyPoints.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1 text-primary font-medium text-sm">
                      <FileText className="h-4 w-4" /> Response Framework
                    </div>
                    <p className="text-sm text-graphite italic">
                      Framework used:{" "}
                      <span className="font-semibold text-indigo">
                        {res.framework}
                      </span>
                    </p>
                  </div>

                  <div className="bg-grayAccent rounded-xl p-4">
                    <p className="text-sm text-indigo mb-2 font-medium">
                      Compare with Your Own Approach
                    </p>
                    <textarea
                      className="w-full h-24 border border-grayNeutral rounded-md p-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Write or paste your own response here..."
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </>
  );
}
