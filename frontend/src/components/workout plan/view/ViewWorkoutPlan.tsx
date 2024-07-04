import { useWorkoutPlanApi } from '@/hooks/useWorkoutPlanApi'
import { ICompleteWorkoutPlan } from '@/interfaces/IWorkoutPlan';
import React, { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner';
import WorkoutPlanContainer from './WorkoutPlanContainer';

const ViewWorkoutPlan = () => {

    const { getWorkoutPlan } = useWorkoutPlanApi();

    const [userPlan, setUserPlan] = useState<ICompleteWorkoutPlan | undefined>()



    useEffect(() => {
        getWorkoutPlan(`6684fe8afecb7e3c47ac9065`)
            .then((workout) => setUserPlan(workout))
            .catch((error) => toast(`${error.message}`, {
                description: `${error.response.data.message}`
            }))
    }, [])

    useEffect(() => {
        console.log(userPlan);

    }, [userPlan])

    return (
        <div
            dir='rtl'
            className='p-5 overflow-y-scroll max-h-screen w-full'
        >
            <h1
                className='text-4xl p-3 underline font-bold'
            >תוכנית אימון</h1>
            {userPlan?.workoutPlans.map(workoutPlan => (
                <div key={workoutPlan.planName}>
                    <WorkoutPlanContainer workoutPlan={workoutPlan} />
                </div>
            ))}
            <Toaster />
        </div>
    )
}

export default ViewWorkoutPlan
