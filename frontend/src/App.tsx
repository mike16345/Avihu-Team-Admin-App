import { Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Navbar/Sidebar";
import RequireAuth from "./hooks/Authentication/RequireAuthentication";
import useAuth from "./hooks/Authentication/useAuth";
import LoginPage from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";

function App() {
  const { authed } = useAuth();

  return (
    <div className="flex size-full ">
      {authed && (
        <div className="sm:block sm:static absolute h-full">
          <Sidebar />
        </div>
      )}
      <div className="size-full p-8 overflow-y-auto custom-scrollbar ">
        <RequireAuth>
          <AppRoutes />
        </RequireAuth>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
      {/* <ReactQueryDevtoolsPanel /> */}
    </div>
  );
}

export default App;
