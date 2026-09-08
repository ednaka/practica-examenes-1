import { Navigate, Route, Routes } from "react-router-dom";
import { LoginRedirect, ProtectedRoute } from "./auth";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { ExamsPage, CreateExamPage, TakeExamPage, ResultsPage } from "./pages/ExamsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/registro" element={<RegistrationPage />} />
        <Route path="/examenes" element={<ExamsPage />} />
        <Route path="/examenes/nuevo" element={<CreateExamPage />} />
        <Route path="/examenes/:id/responder" element={<TakeExamPage />} />
        <Route path="/examenes/:id/resultados" element={<ResultsPage />} />
      </Route>
      <Route path="/" element={<LoginRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
