import "./App.css";
import { Sidebar } from "./components/Navbar/Sidebar";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <div className="flex size-full ">
      <div>
        <Sidebar />
      </div>
      <div className="size-full p-8 overflow-y-auto custom-scrollbar ">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
