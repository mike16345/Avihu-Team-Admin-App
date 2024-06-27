import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import ComboBox from "./ComboBox";
import ExcerciseInput from "./ExcerciseInput";
import { IWorkout, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";

const CreateWorkoutPlan: React.FC = () => {
  const workoutTemp: string[] = [`AB`, `ABC`, `Daily`, `Custom`];
  const excercises: string[] = [`לחיצת חזה`, `פרפר`, `תחתונים`, `סקוואט`];

  const [workoutSplit, setWorkoutSplit] = useState<string>(`AB`);
  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

  const handleAddWorkout = () => {
    const newObject = { name: `אימון ${workoutPlan.length + 1}`, workouts: [] };

    setWorkoutPlan([...workoutPlan, newObject]);
  };

  const handleDeleteWorkout = (name: string) => {
    const filteredArr = workoutPlan.filter((workout) => workout.name !== name);
    const newArr = filteredArr.map((workout, i) => ({ ...workout, name: `אימון ${i + 1}` }));

    setWorkoutPlan(newArr);
  };

  const handleSave = (split: string, workouts: IWorkout[]) => {
    setWorkoutPlan((prevWorkoutPlan) => {
      const workoutExists = prevWorkoutPlan.find((workout) => workout.name === split);

      if (workoutExists) {
        return prevWorkoutPlan.map((workout) =>
          workout.name === split ? { ...workout, workouts: workouts } : workout
        );
      } else {
        return [...prevWorkoutPlan, { name: split, workouts: workouts }];
      }
    });
  };

  useEffect(() => {
    const initalWorkoutPlan = [];
    let iterater = 1;

    switch (workoutSplit) {
      case `AB`:
        iterater = 2;
        break;
      case `ABC`:
        iterater = 3;
        break;
      case `Daily`:
        iterater = 7;
        break;
      case `Custom`:
        iterater = 1;
        break;
    }

    for (let index = 1; index <= iterater; index++) {
      initalWorkoutPlan.push({
        name: `אימון ${index}`,
        workouts: [],
      });
    }

    setWorkoutPlan(initalWorkoutPlan);
  }, [workoutSplit]);

  return (
    <div className="p-5 overflow-y-scroll max-h-[95vh] w-full">
      <h1 className="text-4xl">תוכנית אימון</h1>
      <p>כאן תוכל לייתר תוכנית אימון ללקוחות שלך</p>
      <div className="p-2">
        <ComboBox
          options={workoutTemp}
          handleChange={(currentValue) => setWorkoutSplit(currentValue)}
        />

        {workoutPlan.map((workout) => (
          <div key={workout.name} className="flex">
            <ExcerciseInput
              options={excercises}
              handleSave={(workouts) => handleSave(workout.name, workouts)}
              title={workout.name}
            />
            <Button onClick={() => handleDeleteWorkout(workout.name)}>הסר</Button>
          </div>
        ))}
        {workoutSplit === `Custom` && <Button onClick={handleAddWorkout}>הוסף עוד אימון</Button>}
      </div>
    </div>
  );
};

export default CreateWorkoutPlan;
