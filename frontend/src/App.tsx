import "./App.css";
import { Sidebar } from "./components/Navbar/Sidebar";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <div className="flex size-full ">
      <div>
        <Sidebar />
      </div>
      <div className="size-full py-8 px-4 xs:p-8 overflow-y-auto custom-scrollbar ">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
