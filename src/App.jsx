import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import Welcome from "./pages/Welcome";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import Payment from "./pages/Payment";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PageNotFound from "./pages/PageNotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/results" element={<Results />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
