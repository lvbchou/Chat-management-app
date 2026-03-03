import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AppShell from "../components/AppShell";

import LoginPage from "../pages/LoginPage";
import ConversationsPage from "../pages/ConversationsPage";
import ConversationDetailPage from "../pages/ConversationDetailPage";
import ProfilePage from "../pages/ProfilePage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/conversations" replace />} />
        <Route path="/conversations/:id" element={<ConversationDetailPage />} />
        <Route path="/conversations" element={<ConversationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}