import { EditableContextProvider } from "@/context/useIsEditableContext";
import CreateWorkoutPlan from "./CreateWorkoutPlan";

export const CreateWorkoutPlanWrapper = () => {
  return (
    <EditableContextProvider>
      <CreateWorkoutPlan />
    </EditableContextProvider>
  );
};
