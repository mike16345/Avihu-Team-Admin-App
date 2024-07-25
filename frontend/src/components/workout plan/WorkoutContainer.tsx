import { IMuscleGroupWorkouts, IWorkout } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { FC, useContext, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import DeleteButton from "./buttons/DeleteButton";
import ExcerciseInput from "./ExcerciseInput";
import MuscleGroupSelector from "./MuscleGroupSelector";
import { isEditableContext } from "./CreateWorkoutPlan";
import DeleteModal from "./DeleteModal";


interface IWorkoutContainerProps {
  muscleGroup: IMuscleGroupWorkouts;
  handleUpdateMuscleGroup: (value: string) => void;
  handleUpdateWorkouts: (workoutsObject: IWorkout[]) => void;
  handleDeleteMuscleGroup: () => void;
}

export const WorkoutContainer: FC<IWorkoutContainerProps> = ({
  muscleGroup,
  handleUpdateMuscleGroup,
  handleUpdateWorkouts,
  handleDeleteMuscleGroup,
}) => {
  const isEditable = useContext(isEditableContext);
  const [isDeleteMuscleGroupModalOpen, setIsDeleteMuscleGroupModalOpen] = useState(false);
  const [openMuscleGroupContainer, setOpenMuscleGroupContainer] = useState(false);

  return (
    <Collapsible
      open={openMuscleGroupContainer}
      onOpenChange={setOpenMuscleGroupContainer}
      className=" rounded px-3 py-4 "
    >
      <>
        <div className="flex w-full items-center border-b-2 last:border-b-0 ">
          <div className="flex  py-2 items-center w-full justify-between">
            <div className="flex  items-center gap-2 ">
              <h4 className=" font-bold">קבוצת שריר -</h4>

              {isEditable ? (
                <MuscleGroupSelector
                  handleChange={(value) => handleUpdateMuscleGroup(value)}
                  existingMuscleGroup={muscleGroup.muscleGroup}
                />
              ) : (
                <p>{muscleGroup.muscleGroup}</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              {isEditable && (
                <DeleteButton
                  tip="הסר קבוצת שריר"
                  onClick={() => setIsDeleteMuscleGroupModalOpen(true)}
                />
              )}
              <ChevronsUpDown
                onClick={() => setOpenMuscleGroupContainer((open) => !open)}
                className="ml-2 h-4 w-4 hover:cursor-pointer opacity-50"
              />
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <>
            <ExcerciseInput
              options={muscleGroup?.muscleGroup || ``}
              exercises={muscleGroup.exercises}
              updateWorkouts={(workouts) => handleUpdateWorkouts(workouts)}
            />
          </>
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
