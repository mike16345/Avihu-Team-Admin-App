import { EditableContextProvider } from "@/context/useIsEditableContext";
import CreateWorkoutPlan from "../workout plan/CreateWorkoutPlan";

export const CreateWorkoutPlanWrapper = () => {
  return (
    <EditableContextProvider>
      <CreateWorkoutPlan />
    </EditableContextProvider>
  );
};
