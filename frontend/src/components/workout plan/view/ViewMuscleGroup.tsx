import { IMuscleGroupWorkouts } from '@/interfaces/IWorkoutPlan'
import React from 'react'
import ViewExercise from './ViewExercise'

interface ViewMuscleGroupProps {
    workout: IMuscleGroupWorkouts
}

const ViewMuscleGroup: React.FC<ViewMuscleGroupProps> = ({ workout }) => {
    const { muscleGroup, exercises } = workout
    return (
        <div>
            <h3
                className='text-lg underline p-3 font-bold'
            >סוג שריר: {muscleGroup}</h3>
            {exercises.map(exercise => (
                <div key={exercise._id}>
                    <ViewExercise exercise={exercise} />
                </div>
            ))}
        </div>
    )
}

export default ViewMuscleGroup
