import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Layout from "./components/Layout/Layout";

import Landing from "./pages/Landing/Landing";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import Questions from "./pages/Questions/Questions";
import PostQuestion from "./pages/PostQuestion/PostQuestion";
import QuestionDetail from "./pages/QuestionDetail/QuestionDetail";
import MyQuestions from "./pages/MyQuestions/MyQuestions";
import RagDocuments from "./pages/RagDocuments/RagDocuments";

import NotFound from "./pages/NotFound/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/questions/ask" element={<PostQuestion />} />
          <Route path="/my-questions" element={<MyQuestions />} />
          <Route path="/questions/:questionHash" element={<QuestionDetail />} />
          <Route path="/rag-documents" element={<RagDocuments />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
