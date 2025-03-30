import { IMuscleGroupWorkouts, IExercise } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { FC, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import DeleteButton from "../ui/buttons/DeleteButton";
import ExcerciseInput from "./ExcerciseInput";
import MuscleGroupSelector from "./MuscleGroupSelector";
import DeleteModal from "../Alerts/DeleteModal";
import { Button } from "../ui/button";
import { CollapsibleProps } from "@radix-ui/react-collapsible";

interface IMuscleGroupContainerProps extends CollapsibleProps {
  muscleGroup: IMuscleGroupWorkouts;
  handleUpdateMuscleGroup: (value: string) => void;
  handleDeleteMuscleGroup: () => void;
  parentPath: `workoutPlans.${number}.muscleGroups.${number}`;
}

export const MuscleGroupContainer: FC<IMuscleGroupContainerProps> = ({
  muscleGroup,
  handleUpdateMuscleGroup,
  parentPath,
  handleDeleteMuscleGroup,
  ...props
}) => {
  const [isDeleteMuscleGroupModalOpen, setIsDeleteMuscleGroupModalOpen] = useState(false);
  const [openMuscleGroupContainer, setOpenMuscleGroupContainer] = useState(
    muscleGroup.exercises.length === 0
  );
  const path = parentPath.split(".");

  const muscleGroupsPath = (path[0] +
    "." +
    path[1] +
    ".muscleGroups") as `workoutPlans.${number}.muscleGroups`;

  return (
    <Collapsible
      open={openMuscleGroupContainer}
      onOpenChange={setOpenMuscleGroupContainer}
      className=" rounded pl-4 py-4 "
      {...props}
    >
      <>
        <div className="flex w-full items-center ">
          <div className="flex  py-2 items-center w-full justify-between">
            <div className="flex  items-center gap-2 ">
              <h4 className=" font-bold">קבוצת שריר -</h4>

              <MuscleGroupSelector
                pathToMuscleGroups={muscleGroupsPath}
                handleDismiss={(val) => {
                  if (!val) {
                    handleDeleteMuscleGroup();
                  }
                }}
                handleChange={(value) => handleUpdateMuscleGroup(value)}
                existingMuscleGroup={muscleGroup.muscleGroup}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <DeleteButton
                tip="הסר קבוצת שריר"
                onClick={() => setIsDeleteMuscleGroupModalOpen(true)}
              />

              <Button
                onClick={() => setOpenMuscleGroupContainer((open) => !open)}
                variant="ghost"
                type="button"
                size="sm"
                className={`w-9 p-0 transition`}
              >
                <ChevronsUpDown size={20} className=" opacity-70" />
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <ExcerciseInput
            key={muscleGroup.muscleGroup}
            parentPath={parentPath}
            muscleGroup={muscleGroup?.muscleGroup}
          />
        </CollapsibleContent>

        <DeleteModal
          isModalOpen={isDeleteMuscleGroupModalOpen}
          setIsModalOpen={setIsDeleteMuscleGroupModalOpen}
          onConfirm={() => {
            setIsDeleteMuscleGroupModalOpen(false);
            handleDeleteMuscleGroup();
          }}
        />
      </>
    </Collapsible>
  );
};
