import React, { useState } from "react";
import { IMuscleGroupWorkouts, IExercise } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "../ui/button";
import DeleteButton from "./buttons/DeleteButton";
import { Input } from "../ui/input";
import { FaChevronDown } from "react-icons/fa";
import { MuscleGroupContainer } from "./MuscleGroupContainer";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { useIsEditableContext } from "@/context/useIsEditableContext";

interface WorkoutContainerProps {
  title: string;
  initialMuscleGroups: IMuscleGroupWorkouts[];
  handleSave: (workouts: IMuscleGroupWorkouts[]) => void;
  handlePlanNameChange: (newName: string) => void;
  handleDeleteWorkout: () => void;
  isEdit?: boolean;
}

const WorkoutPlanContainer: React.FC<WorkoutContainerProps> = ({
  handleSave,
  title,
  initialMuscleGroups,
  handlePlanNameChange,
  handleDeleteWorkout,
}) => {
  const { isEditable } = useIsEditableContext();

  const [planName, setPlanName] = useState<string | undefined>();
  console.log("muscle groups", initialMuscleGroups);
  const [muscleGroups, setMuscleGroups] = useState<IMuscleGroupWorkouts[]>(initialMuscleGroups);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const addWorkout = () => {
    const newObject: IMuscleGroupWorkouts = {
      muscleGroup: ``,
      exercises: [],
    };

    if (muscleGroups[0] == undefined) {
      setMuscleGroups([newObject]);
      handleSave([newObject]);
      return;
    }

    setMuscleGroups([...muscleGroups, newObject]);
    handleSave([...muscleGroups, newObject]);
  };

  const updateWorkouts = (i: number, workoutsObject: IExercise[]) => {
    const updatedWorkouts = [...muscleGroups];

    updatedWorkouts[i] = {
      ...muscleGroups[i],
      exercises: workoutsObject,
    };

    setMuscleGroups(updatedWorkouts);
    handleSave(updatedWorkouts);
  };

  const updateMuscleGroup = (i: number, value: string) => {
    const updatedWorkouts = [...muscleGroups];

    updatedWorkouts[i] = {
      ...muscleGroups[i],
      muscleGroup: value,
    };

    setMuscleGroups(updatedWorkouts);
    handleSave(updatedWorkouts);
  };

  const deleteMuscleGroup = (index: number) => {
    const muscleGroupCopy = muscleGroups.filter((_, i) => i !== index);

    setMuscleGroups(muscleGroupCopy);
    handleSave(muscleGroupCopy);
  };

  return (
    <>
      <div className={` border-b-2 last:border-b-0  rounded py-2 `}>
        <Collapsible defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-4 w-full font-bold text-lg px-2 py-3 ">
            {isEditable ? (
              <Input
                className="w-64"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setPlanName(e.target.value)}
                onBlur={(e) => handlePlanNameChange(e.target.value)}
                value={planName ? planName : planName == `` ? planName : title}
              />
            ) : (
              <p>{title}</p>
            )}
            <div className="flex items-center gap-4">
              {isEditable && (
                <DeleteButton tip="הסר אימון" onClick={() => setIsDeleteModalOpen(true)} />
              )}
              <Button
                onClick={() => setIsOpen((state) => !state)}
                variant="ghost"
                size="sm"
                className={`w-9 p-0 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
              >
                <FaChevronDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </div>
          <CollapsibleContent className="flex flex-col gap-4">
            {muscleGroups.map((workout, i) => (
              <MuscleGroupContainer
                key={i}
                muscleGroup={workout}
                handleUpdateWorkouts={(workouts) => updateWorkouts(i, workouts)}
                handleUpdateMuscleGroup={(value) => updateMuscleGroup(i, value)}
                handleDeleteMuscleGroup={() => deleteMuscleGroup(i)}
              />
            ))}
            {isEditable && (
              <div>
                <Button onClick={addWorkout}>הוסף קבוצת שריר</Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={handleDeleteWorkout}
      />
    </>
  );
};

export default WorkoutPlanContainer;
