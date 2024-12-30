import "./App.css";
import { Sidebar } from "./components/Navbar/Sidebar";
import LoginPage from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

function App() {
  return (
    <div className="flex size-full ">
      {/* <LoginPage /> */}
      <div>
        <Sidebar />
      </div>
      <div className="size-full py-8 px-4 xs:p-8 overflow-y-auto custom-scrollbar ">
        <AppRoutes />
      </div>
      {/* <ReactQueryDevtoolsPanel /> */}
    </div>
  );
}

export default App;
