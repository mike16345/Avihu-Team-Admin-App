import React, { useContext, useState } from 'react'
import ExcerciseInput from './ExcerciseInput'
import { IMuscleGroupWorkouts, IWorkout } from '@/interfaces/IWorkoutPlan'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from '../ui/button';
import DeleteButton from './buttons/DeleteButton';
import MuscleGroupSelector from './MuscleGroupSelector';
import { Input } from '../ui/input';
import DeleteModal from './DeleteModal';
import { isEditableContext } from './CreateWorkoutPlan';

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

interface MuscleGroupContainerProps {
  handleSave: (workouts: IMuscleGroupWorkouts[]) => void;
  title: string;
  workout: IMuscleGroupWorkouts[];
  handlePlanNameChange: (newName: string) => void;
  handleDeleteWorkout: () => void
}

const MuscleGroupContainer: React.FC<MuscleGroupContainerProps> = ({
  handleSave,
  title,
  workout,
  handlePlanNameChange,
  handleDeleteWorkout
}) => {
  const [planeName, setPlanName] = useState<string | undefined>();
  const [workouts, setWorkouts] = useState<IMuscleGroupWorkouts[]>(workout);

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
    <div className="border-b-2  rounded py-2 my-1 w-full">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between gap-4 w-full font-bold text-lg pr-5">
          {isEditable ? (
            <Input
              className="w-64"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setPlanName(e.target.value)}
              onBlur={planeName ? () => handlePlanNameChange(planeName) : () => { }}
              value={planeName ? planeName : planeName == `` ? planeName : title}
            />
          ) : (
            <p>{title}</p>
          )}
          <div className='flex items-center gap-4'>
            {isEditable && (
              <DeleteModal
                child={<DeleteButton tip="הסר אימון" />}
                onClick={handleDeleteWorkout}
              />
            )}
            < ChevronsUpDown className="ml-2 h-4 w-4  opacity-50" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {workouts.map((workout, i) => (
            <Collapsible defaultOpen key={i} className="border-2 rounded p-3 my-2">
              <div>
                {!isEditable && <h2 className="font-bold underline">קבוצת שריר:</h2>}
                <CollapsibleTrigger className="flex w-full items-center border-b-2 last:border-b-0 gap-3">
                  <div className="flex gap-7 py-2 items-center w-full justify-between">
                    {isEditable ? (
                      <MuscleGroupSelector
                        options={muscleGroups}
                        handleChange={(value) => updateMuscleGroup(i, value)}
                        existingMuscleGroup={workout.muscleGroup}
                      />
                    ) : (
                      <p className="font-bold text-lg pr-5">{workout.muscleGroup}</p>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      {isEditable && (
                        <DeleteModal
                          child={<DeleteButton tip="מחק קבוצת שריר" />}
                          onClick={() => deleteMuscleGroup(i)}
                        />
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4  opacity-50" />

                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="my-2 w-full">
                    <ExcerciseInput
                      options={workout?.muscleGroup === `חזה` ? chestExercises : shoulderExercises}
                      exercises={workout.exercises}
                      updateWorkouts={(workouts) => updateWorkouts(i, workouts)}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
          {isEditable && (
            <Button onClick={addWorkout} className="my-2">
              הוסף קבוצת שריר
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MuscleGroupContainer;
