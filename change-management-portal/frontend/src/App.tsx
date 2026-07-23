import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ChangeRequestsPage from "./pages/ChangeRequestsPage";
import NewChangeRequestPage from "./pages/NewChangeRequestPage";
import ChangeRequestDetailPage from "./pages/ChangeRequestDetailPage";
import CabApprovalPage from "./pages/CabApprovalPage";
import CalendarPage from "./pages/CalendarPage";
import KpiPage from "./pages/KpiPage";
import AuditLogPage from "./pages/AuditLogPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/change-requests" element={<ChangeRequestsPage />} />
        <Route path="/change-requests/new" element={<NewChangeRequestPage />} />
        <Route path="/change-requests/:id" element={<ChangeRequestDetailPage />} />
        <Route path="/cab" element={<CabApprovalPage />} />
        <Route path="/cab/:id" element={<CabApprovalPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/kpi" element={<KpiPage />} />
        <Route path="/audit-logs" element={<AuditLogPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
