import { Route, Routes } from "react-router-dom";
import RequireAuth from "./hooks/Authentication/RequireAuthentication";
import useAuth from "./hooks/Authentication/useAuth";
import LoginPage from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";
import { AppSidebar } from "./components/Sidebar/AppSidebar";

function App() {
  const { authed } = useAuth();

  return (
    <div className="flex size-full">
      {authed && <AppSidebar />}
      <div className="size-full overflow-y-auto px-6 py-5 custom-scrollbar">
        <RequireAuth>
          <AppRoutes />
        </RequireAuth>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
