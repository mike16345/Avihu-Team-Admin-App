import React, { useState } from "react";
import { IMuscleGroupWorkouts } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "../ui/button";
import DeleteButton from "../ui/buttons/DeleteButton";
import { Input } from "../ui/input";
import { FaChevronDown } from "react-icons/fa";
import { MuscleGroupContainer } from "./MuscleGroupContainer";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import { useWorkoutPlanContext } from "@/context/useWorkoutPlanContext";
import AddButton from "../ui/buttons/AddButton";
import { useDirtyFormContext } from "@/context/useFormContext";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";

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
  const { setIsDirty } = useDirtyFormContext();
  const { isEditable } = useIsEditableContext();
  const { workout, setWorkoutPlan } = useWorkoutPlanContext();

  const [planName, setPlanName] = useState<string | undefined>();
  const [muscleGroups, setMuscleGroups] = useState<IMuscleGroupWorkouts[]>(workout.muscleGroups);
  const [tempMuscleGroupDetails, setTempMuscleGroupDetails] = useState<any>(undefined);
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
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleMuscleGroupChange = (value: string, index: number) => {
    const currentMuscleGroup = muscleGroups[index].muscleGroup;
    const currentExercises = muscleGroups[index].exercises;

    if (currentMuscleGroup !== value && currentExercises.length) {
      setTempMuscleGroupDetails({ value, index });
      setIsMuscleGroupChangedModalOpen(true);
      return;
    }

    handleUpdateWorkout(`muscleGroup`, value, index);
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlanName(e.target.value);
    setIsDirty(true);
  };

  useUnsavedChangesWarning();

  return (
    <>
      <div className={` border-b-2 last:border-b-0  rounded py-2 `}>
        <Collapsible defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-4 w-full font-bold text-lg  py-3 ">
            {isEditable ? (
              <Input
                className="w-full sm:w-64"
                onClick={(e) => e.stopPropagation()}
                onChange={handleChangeName}
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
          <CollapsibleContent className="flex flex-col gap-4 ">
            <DragDropWrapper
              strategy="vertical"
              items={muscleGroups}
              setItems={setMuscleGroups}
              idKey="_id"
            >
              {({ item, index }) => (
                <SortableItem className="border-b-2 last:border-b-0" item={item} idKey="_id">
                  {() => (
                    <MuscleGroupContainer
                      key={item?._id || item.muscleGroup}
                      muscleGroup={item}
                      handleUpdateExercises={(workouts) =>
                        handleUpdateWorkout("exercises", workouts, index)
                      }
                      handleUpdateMuscleGroup={(value) => handleMuscleGroupChange(value, index)}
                      handleDeleteMuscleGroup={() => deleteMuscleGroup(index)}
                    />
                  )}
                </SortableItem>
              )}
            </DragDropWrapper>
            {isEditable && <AddButton tip="הוסף קבוצת שריר" onClick={addWorkout} />}
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
