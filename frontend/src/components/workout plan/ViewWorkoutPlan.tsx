import { useWorkoutPlanApi } from '@/hooks/useWorkoutPlanApi'
import { ICompleteWorkoutPlan } from '@/interfaces/IWorkoutPlan';
import React, { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner';

const ViewWorkoutPlan = () => {

    const { getWorkoutPlan } = useWorkoutPlanApi();

    const [workoutPlan, setWorkoutPlan] = useState<ICompleteWorkoutPlan | undefined>()



    useEffect(() => {
        getWorkoutPlan(`6684fe8afecb7e3c47ac9065`)
            .then((workout) => setWorkoutPlan(workout))
            .catch((error) => toast(`${error.message}`, {
                description: `${error.response.data.message}`
            }))
    }, [])

    useEffect(() => {
        console.log(workoutPlan);

    }, [workoutPlan])


    return (
        <div>
            <Toaster />
        </div>
    )
}

export default ViewWorkoutPlan
