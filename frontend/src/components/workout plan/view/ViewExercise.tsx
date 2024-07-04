import { IWorkout } from '@/interfaces/IWorkoutPlan'
import React from 'react'
import ViewSets from './ViewSets';

interface ViewExerciseProps {
    exercise: IWorkout
}

const ViewExercise: React.FC<ViewExerciseProps> = ({ exercise }) => {
    const { name, linkToVideo, tipFromTrainer, sets } = exercise;
    return (
        <div>
            <h2
                className='text-lg py-2 px-4 '
            >תרגיל: <span className='underline font-bold'>{name}</span></h2>
            {sets.map((set, i) => (
                <div key={set._id}>
                    <ViewSets set={set} num={i} />
                </div>
            ))}

            <p
                className='text-md underline font-bold py-2'
            >דגשים:</p>
            <p>{tipFromTrainer}</p>
            <p
                className='text-md underline font-bold py-2'
            >לינק לסרטון:</p>
            <p>{linkToVideo}</p>
        </div>
    )
}

export default ViewExercise
