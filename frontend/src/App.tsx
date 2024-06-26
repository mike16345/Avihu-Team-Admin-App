import "./App.css";
import { HelloWorld } from "./components/HelloWorld";
import Nav from "./components/Nav";
import CreateWorkoutPlan from "./components/workout plan/CreateWorkoutPlan";

function App() {

  return (
    <div dir="rtl" className="flex">
      <Nav />
      <CreateWorkoutPlan />
    </div>
  );
}

export default App;
