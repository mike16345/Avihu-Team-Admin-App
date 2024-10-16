import React, { useEffect, useState } from "react";
import { IMuscleGroupWorkouts, IExercise, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "../ui/button";
import DeleteButton from "./buttons/DeleteButton";
import { Input } from "../ui/input";
import { FaChevronDown } from "react-icons/fa";
import { MuscleGroupContainer } from "./MuscleGroupContainer";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { useWorkoutPlanContext } from "@/context/useWorkoutPlanContext";

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
  handlePlanNameChange,
  handleDeleteWorkout,
}) => {
  const { isEditable } = useIsEditableContext();
  const { workout, setWorkoutPlan } = useWorkoutPlanContext();

  const [planName, setPlanName] = useState<string | undefined>();
  const [muscleGroups, setMuscleGroups] = useState<IMuscleGroupWorkouts[]>(workout.muscleGroups);
  const [tempMuscleGroupDetails, setTempuscleGroupDetails] = useState<any>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMuscleGroupChangedModalOpen, setIsMuscleGroupChangedModalOpen] = useState(false);

  const addWorkout = () => {
    const newMuscleGroup: IMuscleGroupWorkouts = {
      muscleGroup: ``,
      exercises: [],
    };

    if (!muscleGroups[0]) {
      setMuscleGroups([newMuscleGroup]);
      handleSave([newMuscleGroup]);
      return;
    }

    setMuscleGroups([...muscleGroups, newMuscleGroup]);
    handleSave([...muscleGroups, newMuscleGroup]);
    setWorkoutPlan((prevPlan) => {
      const updatedWorkoutPlan = {
        ...prevPlan,
        muscleGroups: [...prevPlan.muscleGroups, newMuscleGroup],
      };
      updatedWorkoutPlan.muscleGroups.push(newMuscleGroup);

      return updatedWorkoutPlan;
    });
  };

  const handleUpdateWorkout = <K extends keyof IMuscleGroupWorkouts>(
    key: K,
    value: IMuscleGroupWorkouts[K],
    index: number
  ) => {
    const updatedMuscleGroups = [...muscleGroups];

    updatedMuscleGroups[index] = {
      ...muscleGroups[index],
      [key]: value,
    };

    if (key == `muscleGroup`) updatedMuscleGroups[index].exercises = [];

    setMuscleGroups(updatedMuscleGroups);
    handleSave(updatedMuscleGroups);
    setWorkoutPlan((prevPlan) => {
      const updatedWorkoutPlan = { ...prevPlan };
      updatedWorkoutPlan.muscleGroups = updatedMuscleGroups;

      return updatedWorkoutPlan;
    });
  };

  const handleMuscleGroupChange = (value: string, index: number) => {
    if (value !== muscleGroups[index].muscleGroup && muscleGroups[index].muscleGroup) {
      setTempuscleGroupDetails({ value, index });
      setIsMuscleGroupChangedModalOpen(true);
    } else {
      handleUpdateWorkout(`muscleGroup`, value, index);
    }
  };

  const deleteMuscleGroup = (index: number) => {
    const filteredMuscleGroups = muscleGroups.filter((_, i) => i !== index);

    setMuscleGroups(filteredMuscleGroups);
    handleSave(filteredMuscleGroups);
    setWorkoutPlan((prevPlan) => {
      const updatedWorkoutPlan = { ...prevPlan };
      updatedWorkoutPlan.muscleGroups = filteredMuscleGroups;

      return updatedWorkoutPlan;
    });
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
            {muscleGroups.map((muscleGroup, i) => (
              <MuscleGroupContainer
                key={muscleGroup?._id || muscleGroup.muscleGroup}
                muscleGroup={muscleGroup}
                handleUpdateExercises={(workouts) => handleUpdateWorkout("exercises", workouts, i)}
                handleUpdateMuscleGroup={(value) => handleMuscleGroupChange(value, i)}
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
        isModalOpen={isDeleteModalOpen || isMuscleGroupChangedModalOpen}
        setIsModalOpen={isDeleteModalOpen ? setIsDeleteModalOpen : setIsMuscleGroupChangedModalOpen}
        alertMessage={
          isMuscleGroupChangedModalOpen ? (
            <>
              פעולה זו אינה ניתנת לביטול.<br></br> שינוי קבוצת השריר תמחק את כל התרגילים בקבוצת
              השריר הקיימת<br></br>האם אתה בטוח שאתה רוצה להמשיך?
            </>
          ) : undefined
        }
        onConfirm={
          isDeleteModalOpen
            ? handleDeleteWorkout
            : () => {
                const { value, index } = tempMuscleGroupDetails;
                handleUpdateWorkout(`muscleGroup`, value, index);
                setIsMuscleGroupChangedModalOpen(false);
              }
        }
      />
    </>
  );
};

export default WorkoutPlanContainer;
