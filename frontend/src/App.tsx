import { Route, Routes } from "react-router-dom";
import RequireAuth from "./hooks/Authentication/RequireAuthentication";
import useAuth from "./hooks/Authentication/useAuth";
import LoginPage from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";
import { AppSidebar } from "./components/Sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

/**
 * Renders the main application layout with authentication, sidebar, and routing.
 *
 * Displays the sidebar and sidebar trigger when the user is authenticated, and enforces authentication for main application routes. Provides a separate route for the login page.
 */
function App() {
  const { authed } = useAuth();

  return (
    <SidebarProvider className="flex size-full">
      {authed && <AppSidebar />}
      <div className="size-full p-4 overflow-y-auto custom-scrollbar ">
        {authed && <SidebarTrigger />}
        <RequireAuth>
          <AppRoutes />
        </RequireAuth>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </SidebarProvider>
  );
}

export default App;
