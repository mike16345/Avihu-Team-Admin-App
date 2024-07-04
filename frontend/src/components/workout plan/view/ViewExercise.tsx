import { IWorkout } from '@/interfaces/IWorkoutPlan'
import React, { useState } from 'react'
import ViewSets from './ViewSets';
import { Button } from '@/components/ui/button';

interface ViewExerciseProps {
    exercise: IWorkout
}

const ViewExercise: React.FC<ViewExerciseProps> = ({ exercise }) => {
    const { name, linkToVideo, tipFromTrainer, sets } = exercise;
    const [isEdit, setIsEdit] = useState<boolean>(false)

    return (
        <div>
            <div className='flex justify-between'>
                <h2
                    className='text-lg py-2 px-4 '
                >תרגיל: <span className='underline font-bold'>{name}</span></h2>
                <Button
                    className='text-sm py-1 px-2'
                    onClick={() => setIsEdit(!isEdit)}
                >Edit</Button>
            </div>
            {sets.map((set, i) => (
                <div key={set._id}>
                    <ViewSets set={set} num={i} editable={isEdit} />
                </div>
            ))}

            <p
                className='text-md underline font-bold py-2'
            >דגשים:</p>
            <p
                className={`${isEdit ? `border-2 p-1 rounded border-black` : ``}`}
                contentEditable={isEdit}
            >{tipFromTrainer}</p>
            <p
                className='text-md underline font-bold py-2'
            >לינק לסרטון:</p>
            <p
                className={`${isEdit ? `border-2 p-1 rounded border-black` : ``}`}
                contentEditable={isEdit}
            >{linkToVideo}</p>
        </div>
    )
}

export default ViewExercise
