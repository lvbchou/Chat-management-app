import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import LoginPage from "../pages/LoginPage";
import ConversationsPage from "../pages/ConversationsPage";
import ConversationDetailPage from "../pages/ConversationDetailPage";
import ProfilePage from "../pages/ProfilePage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/conversations" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/conversations"
          element={
            <PrivateRoute>
              <ConversationsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/conversations/:id"
          element={
            <PrivateRoute>
              <ConversationDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/conversations" replace />} />
      </Routes>
    </BrowserRouter>
  );
}