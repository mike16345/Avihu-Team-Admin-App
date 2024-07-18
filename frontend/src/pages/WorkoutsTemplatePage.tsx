import TemplateTabs from '@/components/templates/TemplateTabs'
import { tempExercisesArr, tempMusclegroupArr, tempPresetArr } from '@/constants/TempWorkoutPresetConsts'
import { IWorkoutItem } from '@/interfaces/IWorkoutPlan'
import React, { useState } from 'react'

const WorkoutsTemplatePage = () => {

    const [tempPresetState, setTempPresetState] = useState<IWorkoutItem[]>(tempPresetArr)
    const [tempMusclegroupState, setTempMusclegroupState] = useState<IWorkoutItem[]>(tempMusclegroupArr)
    const [tempExerciseState, setTempExerciseState] = useState<IWorkoutItem[]>(tempExercisesArr)

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
                state: tempPresetState,
                setter: setTempPresetState,
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
                state: tempExerciseState,
                setter: setTempExerciseState,
                endPoint: `/workoutPlans/presets/exercises`
            }
        ]
    }


    return (
        <div>
            <TemplateTabs tabs={tabs} />
        </div>
    )
}

export default WorkoutsTemplatePage
