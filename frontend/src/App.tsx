import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Sidebar } from "./components/Navbar/Sidebar";
import RequireAuth from "./hooks/Authentication/RequireAuthentication";
import { AuthProvider } from "./hooks/Authentication/useAuth";
import LoginPage from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { useUsersApi } from "./hooks/api/useUsersApi";
function App() {
  const { checkUserSessionToken } = useUsersApi();

  return (
    <AuthProvider checkToken={checkUserSessionToken}>
      <div className="flex size-full "> 
        <div>
          <Sidebar />
        </div>
        <div className="size-full py-8 px-4 xs:p-8 overflow-y-auto custom-scrollbar ">
          <RequireAuth>
            <AppRoutes />
          </RequireAuth>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
        {/* <ReactQueryDevtoolsPanel /> */}
      </div>
    </AuthProvider>
  );
}

export default App;
