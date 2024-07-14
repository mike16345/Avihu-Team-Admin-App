import "./App.css";
import { Sidebar } from "./components/Navbar/Sidebar";
import { AppRoutes } from "./routes/AppRoutes";
import Nav from "./components/Nav";
import CreateWorkoutPlan from "./components/workout plan/CreateWorkoutPlan";

function App() {
  return (
    <div className="flex size-full">
      <div className="w-1/6 h-full bg-secondary border-l-2">
        <Sidebar />
      </div>
      <div className="w-5/6 h-full p-8 overflow-y-auto ">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
