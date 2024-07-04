import { IWorkoutPlan } from '@/interfaces/IWorkoutPlan';
import React from 'react'
import ViewMuscleGroup from './ViewMuscleGroup';

interface WorkoutPlanContainerProps {
    workoutPlan: IWorkoutPlan
}

const WorkoutPlanContainer: React.FC<WorkoutPlanContainerProps> = ({ workoutPlan }) => {
    const {
        planName,
        workouts
    } = workoutPlan;

    return (
        <div>
            <h2
                className='text-2xl p-5 underline font-bold'
            >{planName}</h2>
            {workouts.map(workout => (
                <div key={workout._id}>
                    <ViewMuscleGroup workout={workout} />
                </div>
            ))}
        </div>
    )
}

export default WorkoutPlanContainer
