import { IMuscleGroupWorkouts, IExercise } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { FC, useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import DeleteButton from "./buttons/DeleteButton";
import ExcerciseInput from "./ExcerciseInput";
import MuscleGroupSelector from "./MuscleGroupSelector";
import DeleteModal from "../Alerts/DeleteModal";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { Button } from "../ui/button";

interface IMuscleGroupContainerProps {
  muscleGroup: IMuscleGroupWorkouts;
  handleUpdateMuscleGroup: (value: string) => void;
  handleUpdateExercises: (exerciseObjects: IExercise[]) => void;
  handleDeleteMuscleGroup: () => void;
}

export const MuscleGroupContainer: FC<IMuscleGroupContainerProps> = ({
  muscleGroup,
  handleUpdateMuscleGroup,
  handleUpdateExercises,
  handleDeleteMuscleGroup,
}) => {
  const { isEditable } = useIsEditableContext();

  const [isDeleteMuscleGroupModalOpen, setIsDeleteMuscleGroupModalOpen] = useState(false);
  const [openMuscleGroupContainer, setOpenMuscleGroupContainer] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if muscleGroups.exercises.length === 0
    if (muscleGroup.exercises.length === 0 && buttonRef.current) {
      buttonRef.current.click(); // Simulate the click
    }
  }, [muscleGroup]);

  return (
    <Collapsible
      open={openMuscleGroupContainer}
      onOpenChange={setOpenMuscleGroupContainer}
      className=" rounded px-3 py-4  border-b-2 last:border-b-0 "
    >
      <>
        <div className="flex w-full items-center ">
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

              <Button
                onClick={() => setOpenMuscleGroupContainer((open) => !open)}
                ref={buttonRef}
                variant="ghost"
                size="sm"
                className={`w-9 p-0 transition }`}
              >
                <ChevronsUpDown size={20} className=" opacity-70" />{" "}
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <>
            <ExcerciseInput
              muscleGroup={muscleGroup?.muscleGroup || ``}
              exercises={muscleGroup.exercises}
              handleUpdateExercises={(workouts) => handleUpdateExercises(workouts)}
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
