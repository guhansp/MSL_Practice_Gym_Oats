import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetConfirmation from "./pages/ResetConfirmation";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import QuestionSelection from "./pages/QuestionSelectionPage";
import Session from "./pages/Session";
import SampleResponses from "./pages/SampleResponses";
import PersonasPage from "./pages/PersonasPage";
import PersonaDetailPage from "./pages/PersonaDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SessionHistory from "./pages/SessionHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-confirmation" element={<ResetConfirmation />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questions" element={<QuestionSelection />} />
        <Route path="/session/:sessionId" element={<Session />} />
         <Route path="/sample-answers" element={<SampleResponses />} />
        <Route path="/personas" element={<PersonasPage />} />
        <Route path="/personas/:personaId" element={<PersonaDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/session/:sessionId" element={<SessionHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
