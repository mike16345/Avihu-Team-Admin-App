import { IWorkoutPlan, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface WorkoutPlanContextProps {
  workout: IWorkoutPlan;
  setWorkoutPlan: Dispatch<SetStateAction<IWorkoutPlan>>;
}

const WorkoutPlanContext = createContext<WorkoutPlanContextProps | null>(null);

export const WorkoutPlanContextProvider: React.FC<{
  children: ReactNode;
  workoutPlan: IWorkoutPlan;
}> = ({ children, workoutPlan }) => {
  const [workout, setWorkoutPlan] = useState(workoutPlan);

  return (
    <WorkoutPlanContext.Provider value={{ workout, setWorkoutPlan }}>
      {children}
    </WorkoutPlanContext.Provider>
  );
};

export const useWorkoutPlanContext = () => {
  const context = useContext(WorkoutPlanContext);

  if (!context) {
    throw new Error("useWorkoutPlanContext must be used within an WorkoutPlanContextProvider");
  }

  return context;
};
