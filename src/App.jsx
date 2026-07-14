import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ModalProvider } from "./context/ModalProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoutes from "./components/auth/PublicRoutes";
import { PORTAL_ROLE_IDS } from "./utils/rolePaths";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./pages/Login/Login";
import AdminRoutes from "./components/routes/AdminRoutes";
import React from "react";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            <Route element={<PublicRoutes />}>
              <Route path="/" element={<Login />} />
            </Route>
            {AdminRoutes()}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
