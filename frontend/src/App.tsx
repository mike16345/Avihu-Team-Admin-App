import "./App.css";
import Nav from "./components/Nav";
import ViewWorkoutPlan from "./components/workout plan/view/ViewWorkoutPlan";

function App() {

  return (
    <div dir="rtl" className="flex">
      <Nav />
      <ViewWorkoutPlan />
    </div>
  );
}

export default App;
