import "./App.css";
import { ModeToggle } from "./components/theme/mode-toggle";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <div className="flex size-full">
      <div className="w-1/4 h-full bg-secondary border-r-2 p-2">
        <ModeToggle />
      </div>
      <div className="w-3/4 h-full p-8 ">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
