import React from "react";
import { useNavigate } from "react-router-dom";
import linePattern from "../assets/pattern.png";
import pattern from "../assets/Pattern_Dot.png";
import Navbar from "../components/NavBar";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Realistic Practice Scenarios",
      description: "Practice answering 20+ challenging physician questions across 7 critical categories including cost, clinical data, and patient acceptance.",
      action: "Browse Questions",
      path: "/questions"
    },
    {
      title: "AI-Powered Coaching",
      description: "Engage in dynamic conversations with AI that simulates real physician interactions, asking clarifying questions and probing deeper like actual healthcare professionals.",
      action: "Start Practicing",
      path: "/sign-up"
    },
    {
      title: "Physician Persona Insights",
      description: "Master the unique communication styles, priorities, and concerns of oncologists, cardiologists, and neurologists to tailor your approach effectively.",
      action: "Explore Personas",
      path: "/personas"
    }
  ];

  const benefits = [
    {
      metric: "20+",
      label: "Practice Questions",
      description: "Covering all major objection categories"
    },
    {
      metric: "3",
      label: "Physician Personas",
      description: "Detailed profiles with engagement strategies"
    },
    {
      metric: "7",
      label: "Question Categories",
      description: "From cost concerns to clinical evidence"
    }
  ];

  const categories = [
    "Cost & Value",
    "Clinical Data & Evidence",
    "Patient Acceptance & Treatment Burden",
    "Clinical Decision-Making & Time Constraints",
    "Data Validity & Study Design",
    "Treatment Practicality",
    "Skepticism & Pushback"
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-[85vh] bg-gradient-to-br from-grayAccent via-grayLight to-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center font-sans py-12 sm:py-20">
        <div className="max-w-4xl">
          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-primary leading-tight mb-6">
            Master High-Stakes MSL Conversations
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-graphite leading-relaxed font-normal max-w-3xl mx-auto mb-8">
            Practice answering challenging physician questions with AI-powered simulations. 
            Build confidence, refine your responses, and master the conversations that determine 
            patient access to breakthrough therapies.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => navigate('/sign-up')}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-base sm:text-lg"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => navigate('/personas')}
              className="w-full sm:w-auto bg-white hover:bg-grayLight text-primary border-2 border-primary px-8 py-4 rounded-xl font-medium transition-all duration-300 text-base sm:text-lg"
            >
              Explore Personas
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs sm:text-sm text-graphite font-mono tracking-wide">
            Evidence-based training for Medical Science Liaisons
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary font-medium mb-4">
              How It Works
            </h2>
            <p className="text-graphite text-sm sm:text-base max-w-2xl mx-auto">
              A systematic approach to mastering physician conversations through deliberate practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Select a Question",
                description: "Choose from 20+ realistic physician objections across 7 categories"
              },
              {
                step: "02",
                title: "Choose a Persona",
                description: "Select the physician type you want to practice with - each with unique communication styles"
              },
              {
                step: "03",
                title: "Practice with AI",
                description: "Engage in realistic conversations where AI probes deeper and asks clarifying questions"
              },
              {
                step: "04",
                title: "Get Feedback",
                description: "Receive actionable insights, track progress, and build confidence over time"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-grayLight border border-primary p-6 rounded-xl hover:shadow-md transition-shadow">
                  <div className="text-primary font-mono font-bold text-3xl sm:text-4xl mb-4 opacity-50">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif text-primary font-medium mb-3">
                    {item.title}
                  </h3>
                  <p className="text-graphite text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="text-primary text-2xl">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-grayAccent py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary font-medium mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-graphite text-sm sm:text-base max-w-2xl mx-auto">
              Comprehensive tools designed specifically for MSL professional development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border-t-4 border-primary hover:shadow-xl transition-shadow">
                <h3 className="text-lg sm:text-xl font-serif text-primary font-medium mb-3">
                  {feature.title}
                </h3>
                <p className="text-graphite text-xs sm:text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
                <button
                  onClick={() => navigate(feature.path)}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
                >
                  {feature.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8"
               style={{
      backgroundImage: `url(${pattern})`,
      backgroundRepeat: "repeat",
      backgroundSize: "contain",
      backgroundPosition: "center",
    }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center bg-grayLight border-2 border-primary p-6 sm:p-8 rounded-2xl">
                <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary font-mono mb-3">
                  {benefit.metric}
                </p>
                <h4 className="text-base sm:text-lg font-serif text-primary font-medium mb-2">
                  {benefit.label}
                </h4>
                <p className="text-graphite text-xs sm:text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Question Categories */}
      <section className="bg-grayAccent py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary font-medium mb-4">
              Practice Across 7 Critical Categories
            </h2>
            <p className="text-graphite text-sm sm:text-base max-w-2xl mx-auto">
              Master the full spectrum of physician objections and concerns
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white border-l-4 border-primary p-4 sm:p-5 rounded-r-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm sm:text-base text-primary font-medium">
                  {category}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/questions')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-medium transition-colors duration-300 text-sm sm:text-base"
            >
              View All Questions
            </button>
          </div>
        </div>
      </section>

      {/* Physician Personas Preview */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary font-medium mb-4">
              Understand Your Audience
            </h2>
            <p className="text-graphite text-sm sm:text-base max-w-2xl mx-auto">
              Each physician type has unique priorities, communication styles, and decision-making factors
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                id: "oncologist",
                name: "Dr. Sarah Chen",
                title: "Medical Oncologist",
                specialty: "Academic Medical Center",
                style: "Evidence-focused, analytical, data-driven"
              },
              {
                id: "cardiologist",
                name: "Dr. Michael Torres",
                title: "Cardiologist",
                specialty: "Large Private Practice",
                style: "Practical, risk-averse, workflow-focused"
              },
              {
                id: "neurologist",
                name: "Dr. Jennifer Williams",
                title: "Neurologist",
                specialty: "Community Hospital",
                style: "Empathetic, pragmatic, resource-conscious"
              }
            ].map((persona) => (
              <div
                key={persona.id}
                className="bg-grayLight border-2 border-primary p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/personas/${persona.id}`)}
              >
                <h4 className="text-lg sm:text-xl font-serif text-primary font-medium mb-2">
                  {persona.name}
                </h4>
                <p className="text-sm text-graphite font-medium mb-1">{persona.title}</p>
                <p className="text-xs text-graphite mb-4">{persona.specialty}</p>
                <p className="text-xs sm:text-sm text-primary border-t border-grayNeutral pt-3">
                  {persona.style}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/personas')}
              className="bg-white hover:bg-grayLight text-primary border-2 border-primary px-8 py-4 rounded-xl font-medium transition-colors duration-300 text-sm sm:text-base"
            >
              View All Personas
            </button>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="bg-grayAccent py-12 sm:py-20 px-4 sm:px-6 lg:px-8"
               style={{
      backgroundImage: `url(${linePattern})`,
      backgroundRepeat: "repeat",
      backgroundSize: "contain",
      backgroundPosition: "center",
    }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 border-t-4 border-primary">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary font-medium mb-6 text-center">
              Why MSL Communication Matters
            </h2>
            
            <div className="space-y-6">
              <p className="text-graphite text-sm sm:text-base leading-relaxed">
                Medical Science Liaisons face some of the most challenging conversations in healthcare. 
                When a physician asks a tough question about cost, clinical data, or treatment burden, 
                your response can determine whether patients get access to life-changing therapies.
              </p>

              <div className="bg-grayLight border-l-4 border-primary p-4 sm:p-6 rounded-r-lg">
                <p className="text-primary font-medium text-sm sm:text-base mb-2">
                  The Challenge
                </p>
                <p className="text-graphite text-xs sm:text-sm leading-relaxed">
                  Unlike generic presentation coaching, MSL conversations require scientific credibility, 
                  regulatory awareness, cost justification, and patient outcome focus - all delivered in 
                  90-second exchanges under pressure.
                </p>
              </div>

              <div className="bg-grayLight border-l-4 border-primary p-4 sm:p-6 rounded-r-lg">
                <p className="text-primary font-medium text-sm sm:text-base mb-2">
                  Our Solution
                </p>
                <p className="text-graphite text-xs sm:text-sm leading-relaxed">
                  The DNATE MSL Practice Gym provides a safe environment to practice, fail, learn, and 
                  improve. Our AI doesn't just give answers - it challenges you like a real physician would, 
                  asking follow-up questions and probing your understanding.
                </p>
              </div>

              <div className="bg-grayLight border-l-4 border-primary p-4 sm:p-6 rounded-r-lg">
                <p className="text-primary font-medium text-sm sm:text-base mb-2">
                  Your Results
                </p>
                <p className="text-graphite text-xs sm:text-sm leading-relaxed">
                  Track your progress with detailed analytics, identify weak areas, build streaks, 
                  and watch your confidence grow across all question categories. Every practice session 
                  brings you closer to mastering the conversations that matter most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Achieve Section */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary font-medium mb-4">
              What You'll Achieve
            </h2>
            <p className="text-graphite text-sm sm:text-base max-w-2xl mx-auto">
              Transform your MSL communication skills with measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Build Confidence",
                description: "Practice difficult scenarios in a safe environment. Track confidence ratings across categories and see measurable improvement over time."
              },
              {
                title: "Master Physician Psychology",
                description: "Understand what drives oncologists, cardiologists, and neurologists. Learn their priorities, concerns, and preferred communication styles."
              },
              {
                title: "Refine Your Responses",
                description: "Get AI-powered feedback on clarity, evidence usage, and empathy. Compare your approach to best practices and expert frameworks."
              },
              {
                title: "Track Your Progress",
                description: "Monitor practice frequency, streak consistency, category strengths, and confidence trends with detailed analytics and visualizations."
              },
              {
                title: "Prepare for Real Scenarios",
                description: "Access sample expert responses, review key talking points, and study response frameworks for every question type."
              },
              {
                title: "Develop Consistency",
                description: "Build daily practice habits with streak tracking, goal setting, and progress monitoring to ensure continuous improvement."
              }
            ].map((achievement, index) => (
              <div
                key={index}
                className="bg-grayLight border border-grayNeutral p-6 rounded-xl hover:border-primary transition-colors"
              >
                <h4 className="text-base sm:text-lg font-serif text-primary font-medium mb-3">
                  {achievement.title}
                </h4>
                <p className="text-graphite text-xs sm:text-sm leading-relaxed">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/90 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white font-medium mb-6">
            Ready to Master High-Stakes Conversations?
          </h2>
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Join MSLs who are transforming their communication skills and improving patient access to breakthrough therapies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/sign-up')}
              className="w-full sm:w-auto bg-white hover:bg-grayLight text-primary px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg text-base sm:text-lg"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border-2 border-white px-8 py-4 rounded-xl font-medium transition-all duration-300 text-base sm:text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-serif text-base sm:text-lg font-medium mb-4">Product</h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button onClick={() => navigate('/questions')} className="hover:text-primary transition-colors">
                    Practice Questions
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/personas')} className="hover:text-primary transition-colors">
                    Physician Personas
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-base sm:text-lg font-medium mb-4">Features</h5>
              <ul className="space-y-2 text-xs sm:text-sm text-white/80">
                <li>AI-Powered Coaching</li>
                <li>Progress Tracking</li>
                <li>Streak Analytics</li>
                <li>Expert Feedback</li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-base sm:text-lg font-medium mb-4">Account</h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button onClick={() => navigate('/sign-up')} className="hover:text-primary transition-colors">
                    Sign Up
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/sign-in')} className="hover:text-primary transition-colors">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/profile')} className="hover:text-primary transition-colors">
                    My Profile
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-base sm:text-lg font-medium mb-4">About DNATE</h5>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Transforming high-stakes communication in life sciences through evidence-based training.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-xs sm:text-sm text-white/60 font-mono">
              © 2025 DNATE MSL Practice Gym. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}