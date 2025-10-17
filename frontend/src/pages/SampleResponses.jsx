import React, { useState } from "react";
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
  const [selectedPersona, setSelectedPersona] = useState("Oncologist");
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

  const personas = ["Oncologist", "Cardiologist", "Neurologist"];

  const sampleResponses = [
    // --- Oncologist ---
    {
      category: "Clinical Data & Evidence",
      persona: "Oncologist",
      title: "Your pivotal study had limited diversity. How can I trust its applicability across tumor subtypes?",
      response: `That’s an important question. While the phase III trial focused on adenocarcinoma, subsequent pooled analyses included squamous cell histology and other variants. The hazard ratio for progression-free survival was consistent across subgroups, and safety profiles were comparable. Additionally, a multinational registry with 2,300 patients is validating these outcomes across real-world tumor types.`,
      keyPoints: [
        "Acknowledges population diversity gap",
        "References subgroup and registry validation",
        "Positions transparency and inclusivity in data reporting",
      ],
      framework: "STAR",
    },
    {
      category: "Skepticism & Pushback",
      persona: "Oncologist",
      title: "Real-world data don’t match your trial outcomes. Why should I believe your conclusions?",
      response: `That’s a fair concern. Real-world evidence often reflects broader patient populations. In our registry of 5,200 patients across 14 countries, median overall survival was within 0.8 months of the phase III results. These findings are undergoing peer review, and full data transparency has been prioritized.`,
      keyPoints: [
        "Acknowledges real-world variability",
        "Provides quantitative comparison to trial data",
        "Emphasizes peer-reviewed transparency",
      ],
      framework: "ACK",
    },
    {
      category: "Treatment Practicality",
      persona: "Oncologist",
      title: "I’m worried about managing immune-related adverse events with this therapy.",
      response: `That’s understandable. Grade 3 or higher immune events occurred in 7% of patients, predominantly during the first two cycles. Our monitoring guide includes early steroid initiation protocols, which helped 85% of affected patients resume therapy within 4 weeks.`,
      keyPoints: [
        "Normalizes safety concern empathetically",
        "Cites incidence and recovery data",
        "Offers practical management guidance",
      ],
      framework: "LEAP",
    },

    // --- Cardiologist ---
    {
      category: "Cost & Value",
      persona: "Cardiologist",
      title: "This therapy is costly. How does it demonstrate value in cardiovascular outcomes?",
      response: `Absolutely valid point. The annual therapy cost is offset by a 27% reduction in major adverse cardiovascular events (MACE) and a 31% decrease in all-cause hospitalizations. Health-economic models project a net savings of $3,200 per patient annually within 18 months.`,
      keyPoints: [
        "Connects cost to measurable outcome reductions",
        "Quantifies savings over time",
        "Positions value through total cost of care lens",
      ],
      framework: "CAR",
    },
    {
      category: "Clinical Decision-Making & Time Constraints",
      persona: "Cardiologist",
      title: "I already manage multiple therapies — how can I efficiently identify eligible patients?",
      response: `That’s a great question. We’ve integrated the latest ACC/AHA criteria into an EMR-compatible algorithm that flags eligible patients based on LDL thresholds and prior statin use. Early adopters reported a 45% reduction in screening time with this system.`,
      keyPoints: [
        "Links to practical, workflow-based solutions",
        "References real implementation metrics",
        "Reduces perceived workload barrier",
      ],
      framework: "BRIDGE",
    },
    {
      category: "Data Validity & Study Design",
      persona: "Cardiologist",
      title: "Was your comparator arm truly at the current guideline dose?",
      response: `Yes, it reflected the dosing standard at the time of study initiation (2018). Sensitivity analyses using 2022 guideline thresholds confirmed consistent 24% MACE reduction. Results were later validated in a meta-analysis of 18,000 patients across 9 trials.`,
      keyPoints: [
        "Clarifies trial context and evolution of standards",
        "Provides quantitative validation across meta-analyses",
        "Maintains data integrity without defensiveness",
      ],
      framework: "STAR",
    },

    // --- Neurologist ---
    {
      category: "Patient Acceptance & Treatment Burden",
      persona: "Neurologist",
      title: "My patients already take several medications. How will they adhere to this one?",
      response: `That’s a key concern. The formulation was specifically designed for once-daily dosing with minimal titration. In a 12-month adherence study, mean medication possession ratio exceeded 92%. Our digital companion app further improved adherence by 18% in patients with mild cognitive impairment.`,
      keyPoints: [
        "Empathizes with adherence challenges",
        "Shares real adherence metrics",
        "Highlights patient-support innovation",
      ],
      framework: "LEAP",
    },
    {
      category: "Data Validity & Study Design",
      persona: "Neurologist",
      title: "How robust are your cognitive endpoints given variability in testing tools?",
      response: `Excellent question. Cognitive endpoints were assessed using MoCA and CDR-SB across 74 sites, with inter-rater reliability exceeding 0.92. Sensitivity analyses confirmed consistent results across both tools, reinforcing robustness.`,
      keyPoints: [
        "Explains endpoint reliability and statistical validation",
        "Addresses methodological rigor clearly",
        "Supports trust through data consistency metrics",
      ],
      framework: "STAR",
    },
    {
      category: "Treatment Practicality",
      persona: "Neurologist",
      title: "Are infusion reactions frequent with this therapy?",
      response: `In the pivotal trial, infusion reactions occurred in 4.6% of patients, with 98% resolving within 24 hours using antihistamine premedication. No discontinuations were required. We provide a nurse-administered infusion protocol to ensure comfort and continuity.`,
      keyPoints: [
        "Normalizes and quantifies risk",
        "Offers proactive mitigation strategy",
        "Reassures about continuity of therapy",
      ],
      framework: "ACK",
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
              className="border border-grayNeutral rounded-md px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
              className="border border-grayNeutral rounded-md px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
              className="bg-white rounded-2xl shadow-sm mb-6 border border-grayNeutral transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === idx ? null : idx)
                }
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <div>
                  <h2 className="text-lg md:text-xl font-serif text-indigo leading-snug">
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
                  <div className="flex items-center gap-2 mb-3 text-primary font-semibold text-sm">
                    <Sparkles className="h-4 w-4" /> Expert Sample
                  </div>
                  <p className="text-sm md:text-[15px] text-indigo leading-relaxed mb-4">
                    {res.response}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1 text-primary font-semibold text-sm">
                      <ClipboardCheck className="h-4 w-4" /> Key Talking Points
                    </div>
                    <ul className="list-disc list-inside text-sm text-graphite leading-relaxed">
                      {res.keyPoints.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1 text-primary font-semibold text-sm">
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
                    <p className="text-sm text-indigo mb-2 font-semibold">
                      Compare with Your Own Approach
                    </p>
                    <textarea
                      className="w-full h-24 border border-grayNeutral rounded-md p-2 text-sm text-graphite focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
