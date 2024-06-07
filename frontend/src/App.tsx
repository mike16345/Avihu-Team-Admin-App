import "./App.css";
import { ModeToggle } from "./components/theme/mode-toggle";
import { ThemeProvider } from "./components/theme/theme-provider";
import { ViewDietPlanPage } from "./pages/ViewDietPlanPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex w-full h-full  items-center">
        <div className="w-1/4 h-full bg-secondary border-r-2 p-2">
          <ModeToggle />
        </div>
        <div className="w-3/4 h-full p-8 ">
          <ViewDietPlanPage />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
