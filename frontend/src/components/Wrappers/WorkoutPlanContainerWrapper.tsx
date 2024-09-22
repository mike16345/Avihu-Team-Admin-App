import { WorkoutPlanContextProvider } from "@/context/useWorkoutPlanContext";
import { IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { FC, PropsWithChildren } from "react";

interface WorkoutPlanContainerWrapperProps extends PropsWithChildren {
  workoutPlan: IWorkoutPlan;
}

const WorkoutPlanContainerWrapper: FC<WorkoutPlanContainerWrapperProps> = ({
  workoutPlan,
  children,
}) => {
  return (
    <WorkoutPlanContextProvider workoutPlan={workoutPlan}>{children}</WorkoutPlanContextProvider>
  );
};

export default WorkoutPlanContainerWrapper;
