import React, { useContext, useState } from "react";
import { IMuscleGroupWorkouts, IWorkout } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "../ui/button";
import DeleteButton from "./buttons/DeleteButton";
import { Input } from "../ui/input";
import { isEditableContext } from "./CreateWorkoutPlan";
import { FaChevronDown } from "react-icons/fa";
import { WorkoutContainer } from "./WorkoutContainer";
import DeleteModal from "./DeleteModal";

interface MuscleGroupContainerProps {
  title: string;
  workout: IMuscleGroupWorkouts[];
  handleSave: (workouts: IMuscleGroupWorkouts[]) => void;
  handlePlanNameChange: (newName: string) => void;
  handleDeleteWorkout: () => void;
}

const MuscleGroupContainer: React.FC<MuscleGroupContainerProps> = ({
  handleSave,
  title,
  workout,
  handlePlanNameChange,
  handleDeleteWorkout,
}) => {
  const [planeName, setPlanName] = useState<string | undefined>();
  const [workouts, setWorkouts] = useState<IMuscleGroupWorkouts[]>(workout);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isEditable = useContext(isEditableContext);

  const addWorkout = () => {
    const newObject: IMuscleGroupWorkouts = {
      muscleGroup: ``,
      exercises: [],
    };

    if (workouts[0] == undefined) {
      setWorkouts([newObject]);
      handleSave([newObject]);
      return;
    }
    setWorkouts([...workouts, newObject]);
    handleSave([...workouts, newObject]);
  };

  const updateWorkouts = (i: number, workoutsObject: IWorkout[]) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[i] = {
      ...workouts[i],
      exercises: workoutsObject,
    };

    setWorkouts(updatedWorkouts);
    handleSave(updatedWorkouts);
  };

  const updateMuscleGroup = (i: number, value: string) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[i] = {
      ...workouts[i],
      muscleGroup: value,
    };

    setWorkouts(updatedWorkouts);
    handleSave(updatedWorkouts);
  };

  const deleteMuscleGroup = (index: number) => {
    const muscleGroupCopy = workouts.filter((_, i) => i !== index);

    setWorkouts(muscleGroupCopy);
    handleSave(muscleGroupCopy);
  };

  return (
    <>
      <div className={`${isEditable && "border-b-2"} last:border-b-0  rounded py-2 `}>
        <Collapsible defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-4 w-full font-bold text-lg ">
            {isEditable ? (
              <Input
                className="w-64"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setPlanName(e.target.value)}
                onBlur={planeName ? () => handlePlanNameChange(planeName) : () => {}}
                value={planeName ? planeName : planeName == `` ? planeName : title}
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
          <CollapsibleContent>
            {workouts.map((workout, i) => (
              <WorkoutContainer
                key={i}
                muscleGroup={workout}
                handleUpdateWorkouts={(workouts) => updateWorkouts(i, workouts)}
                handleUpdateMuscleGroup={(value) => updateMuscleGroup(i, value)}
                handleDeleteMuscleGroup={() => deleteMuscleGroup(i)}
              />
            ))}
            {isEditable && <Button onClick={addWorkout}>הוסף קבוצת שריר</Button>}
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

export default MuscleGroupContainer;
