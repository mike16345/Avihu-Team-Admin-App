import TemplateTabs from '@/components/templates/TemplateTabs'
import {  tempMusclegroupArr, tempPresetArr } from '@/constants/TempWorkoutPresetConsts'
import useExercisePresetApi from '@/hooks/useExercisePresetApi'
import { useWorkoutPlanPresetApi } from '@/hooks/useWorkoutPlanPresetsApi'
import { ICompleteWorkoutPlan, IWorkoutItem } from '@/interfaces/IWorkoutPlan'
import React, { useEffect, useState } from 'react'

const WorkoutsTemplatePage = () => {

    const { getExercisePresets, deleteExercise } = useExercisePresetApi()
    const {getAllWorkoutPlanPresets}=useWorkoutPlanPresetApi()

    const [workoutPlanPresets, setWorkoutPlanPresets] = useState<ICompleteWorkoutPlan[]>()
    const [tempMusclegroupState, setTempMusclegroupState] = useState<IWorkoutItem[]>(tempMusclegroupArr)
    const [exercisePresets, setExercisePresets] = useState<IWorkoutItem[]>()

    const tabs: ITabs = {
        tabHeaders: [
            {
                name: `תבניות אימונים`,
                value: `WorkoutPlans`
            }, {
                name: `קבוצות שריר`,
                value: `muscleGroups`
            }, {
                name: `תרגילים`,
                value: `exercises`
            }],
        tabContent: [
            {
                value: `WorkoutPlans`,
                navURL: `/workoutPlans/presets/workout-template`,
                btnPrompt: `הוסף תבנית`,
                state: workoutPlanPresets,
                setter: setWorkoutPlanPresets,
                endPoint: `/workoutPlans/presets/workout-template`
            },
            {
                value: `muscleGroups`,
                navURL: `/workoutPlans/presets/muscleGroups`,
                btnPrompt: `הוסף קבוצת שריר`,
                state: tempMusclegroupState,
                setter: setTempMusclegroupState,
                endPoint: `/workoutPlans/presets/muscleGroups`
            },
            {
                value: `exercises`,
                navURL: `/workoutPlans/presets/exercises`,
                btnPrompt: `הוסף תרגיל`,
                state: exercisePresets,
                setter: deleteExercise,
                endPoint: `/presets/exercises`
            }
        ]
    }

    useEffect(() => {
        getExercisePresets()
            .then(res => setExercisePresets(res))
            .catch(err => console.log(err))

        getAllWorkoutPlanPresets()
        .then(res=>setWorkoutPlanPresets(res))
        .catch(err=>console.log(err))
    }, [])


    return (
        <div>
            <h1 className='text-2xl pb-5'>תבניות אימון</h1>
            {exercisePresets && workoutPlanPresets &&
                <TemplateTabs tabs={tabs} />
            }
        </div>
    )
}

export default WorkoutsTemplatePage
