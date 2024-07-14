import "./App.css";
import { Sidebar } from "./components/Navbar/Sidebar";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <div className="flex size-full ">
      <div className="w-1/6 h-full bg-secondary border-l-2">
        <Sidebar />
      </div>
      <div className="w-5/6 h-full p-8 overflow-y-auto custom-scrollbar ">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
