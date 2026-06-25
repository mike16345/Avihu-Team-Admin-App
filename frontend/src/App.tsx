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
    <div className="flex h-full w-full" dir="rtl">
      {authed && <AppSidebar />}
      <div
        ref={mainScrollRef}
        className="flex-1 min-w-0 h-full overflow-y-auto bg-slate-100/70 px-20 py-14 custom-scrollbar dark:bg-slate-950/60"
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
