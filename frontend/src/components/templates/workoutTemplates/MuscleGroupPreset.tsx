import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import DeleteButton from "@/components/workout plan/buttons/DeleteButton";
import DeleteModal from "@/components/workout plan/DeleteModal";
import { IMuscleGroupWorkouts, IWorkout } from "@/interfaces/IWorkoutPlan";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import WorkoutContainerPreset from "./WorkoutContainerPreset";

interface MuscleGroupPresetProps {
  handleSave: (workouts: IMuscleGroupWorkouts[]) => void;
  title: string;
  workout: IMuscleGroupWorkouts[];
  handlePlanNameChange: (newName: string) => void;
  handleDeleteWorkout: () => void;
}

const MuscleGroupPreset: React.FC<MuscleGroupPresetProps> = ({
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
      <div className="border-b-2  last:border-b-0  rounded py-2 ">
        <Collapsible defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-4 w-full font-bold text-lg">
            <Input
              className="w-64"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setPlanName(e.target.value)}
              onBlur={planeName ? () => handlePlanNameChange(planeName) : () => {}}
              value={planeName ? planeName : planeName == `` ? planeName : title}
            />
            <div className="flex items-center gap-4">
              <DeleteButton tip="הסר אימון" onClick={() => setIsDeleteModalOpen(true)} />
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
              <WorkoutContainerPreset
                key={i}
                muscleGroup={workout}
                handleUpdateWorkouts={(workouts) => updateWorkouts(i, workouts)}
                handleUpdateMuscleGroup={(value) => updateMuscleGroup(i, value)}
                handleDeleteMuscleGroup={() => deleteMuscleGroup(i)}
              />
            ))}
            <Button onClick={addWorkout} className="my-2">
              הוסף קבוצת שריר
            </Button>
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

export default MuscleGroupPreset;
