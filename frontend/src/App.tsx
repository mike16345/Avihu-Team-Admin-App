import { useRef } from "react";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./hooks/Authentication/RequireAuthentication";
import useAuth from "./hooks/Authentication/useAuth";
import { useScrollRestoration } from "./hooks/useScrollRestoration";
import LoginPage from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";
import { AppSidebar } from "./components/Sidebar/AppSidebar";

function App() {
  const { authed } = useAuth();
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  // Restore the user's exact scroll position on back/forward navigation.
  useScrollRestoration(mainScrollRef);

  return (
    <div className="flex size-full">
      {authed && <AppSidebar />}
      <div
        ref={mainScrollRef}
        className="size-full overflow-y-auto px-[120px] py-[84px] custom-scrollbar"
      >
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
