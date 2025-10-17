import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetConfirmation from "./pages/ResetConfirmation";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import QuestionSelection from "./pages/QuestionSelectionPage";
import SampleResponses from "./pages/SampleResponses";

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
         <Route path="/sample-answers" element={<SampleResponses />} />
      </Routes>
    </Router>
  );
}

export default App;
