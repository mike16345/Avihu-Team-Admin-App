import { DirtyFormProvider } from "@/context/useFormContext";
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
    <WorkoutPlanContextProvider workoutPlan={workoutPlan}>
      <DirtyFormProvider>{children}</DirtyFormProvider>
    </WorkoutPlanContextProvider>
  );
};

export default WorkoutPlanContainerWrapper;
