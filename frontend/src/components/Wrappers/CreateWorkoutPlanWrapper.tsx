import { EditableContextProvider } from "@/context/useIsEditableContext";
import CreateWorkoutPlan from "../workout plan/CreateWorkoutPlan";
import { DirtyFormProvider } from "@/context/useFormContext";

export const CreateWorkoutPlanWrapper = () => {
  return (
    <EditableContextProvider>
      <DirtyFormProvider>
        <CreateWorkoutPlan />
      </DirtyFormProvider>
    </EditableContextProvider>
  );
};
