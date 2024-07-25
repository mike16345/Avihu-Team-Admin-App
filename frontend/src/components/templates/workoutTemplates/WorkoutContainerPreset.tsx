import DeleteButton from "@/components/workout plan/buttons/DeleteButton";
import DeleteModal from "@/components/workout plan/DeleteModal";
import MuscleGroupSelector from "@/components/workout plan/MuscleGroupSelector";
import { IMuscleGroupWorkouts, IWorkout } from "@/interfaces/IWorkoutPlan";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import ExerciseInputpreset from "./ExerciseInputpreset";

const muscleGroups: string[] = [
    "חזה",
    "כתפיים",
    "יד אחורית",
    "גב",
    "יד קידמית",
    "רגליים",
    "בטן",
    "אירובי",
];

const chestExercises: string[] = [
    "פרפר",
    "מקבילים",
    "לחיצת חזה בשיפוע שלילי",
    "לחיצת חזה בשיפוע חיובי",
    "לחיצת חזה",
];
const shoulderExercises: string[] = ["כתפיים"];

interface IWorkoutContainerPresetProps {
    muscleGroup: IMuscleGroupWorkouts;
    handleUpdateMuscleGroup: (value: string) => void;
    handleUpdateWorkouts: (workoutsObject: IWorkout[]) => void;
    handleDeleteMuscleGroup: () => void;
}

const WorkoutContainerPreset: React.FC<IWorkoutContainerPresetProps> = ({
    muscleGroup,
    handleUpdateMuscleGroup,
    handleUpdateWorkouts,
    handleDeleteMuscleGroup,
}) => {

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

                            <MuscleGroupSelector
                                options={muscleGroups}
                                handleChange={(value) => handleUpdateMuscleGroup(value)}
                                existingMuscleGroup={muscleGroup.muscleGroup}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <DeleteButton
                                tip="הסר קבוצת שריר"
                                onClick={() => setIsDeleteMuscleGroupModalOpen(true)}
                            />
                            <ChevronsUpDown
                                onClick={() => setOpenMuscleGroupContainer((open) => !open)}
                                className="ml-2 h-4 w-4 hover:cursor-pointer opacity-50"
                            />
                        </div>
                    </div>
                </div>
                <CollapsibleContent>
                    <>
                        <ExerciseInputpreset
                            options={muscleGroup.muscleGroup || undefined}
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
    )
}

export default WorkoutContainerPreset
