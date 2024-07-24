import TemplateTabs from '@/components/templates/TemplateTabs'
import { tempMusclegroupArr, tempPresetArr } from '@/constants/TempWorkoutPresetConsts'
import useExercisePresetApi from '@/hooks/useExercisePresetApi'
import { useWorkoutPlanPresetApi } from '@/hooks/useWorkoutPlanPresetsApi'
import { ICompleteWorkoutPlan, IExercisePresetItem, } from '@/interfaces/IWorkoutPlan'
import React, { useEffect, useState } from 'react'

const WorkoutsTemplatePage = () => {

    const { getExercisePresets, deleteExercise } = useExercisePresetApi()

    /*  const [workoutPlanPresets, setWorkoutPlanPresets] = useState<IWorkoutItem[]>(tempPresetArr)
     const [tempMusclegroupState, setTempMusclegroupState] = useState<IWorkoutItem[]>(tempMusclegroupArr) */
    const [exercisePresets, setExercisePresets] = useState<IExercisePresetItem[]>()


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
            /*   {
                  value: `WorkoutPlans`,
                  navURL: `/workoutPlans/presets/workout-template`,
                  btnPrompt: `הוסף תבנית`,
                  state: workoutPlanPresets,
                  setter: setWorkoutPlanPresets,
              },
              {
                  value: `muscleGroups`,
                  navURL: `/workoutPlans/presets/muscleGroups`,
                  btnPrompt: `הוסף קבוצת שריר`,
                  state: tempMusclegroupState,
                  setter: setTempMusclegroupState,
              }, */
            {
                value: `exercises`,
                btnPrompt: `הוסף תרגיל`,
                state: exercisePresets,
                sheetForm: `Exercise`,
                deleteFunc: deleteExercise
            }
        ]
    }

    useEffect(() => {
        getExercisePresets()
            .then(res => setExercisePresets(res))
            .catch(err => console.log(err))

        /*  getAllWorkoutPlanPresets()
             .then(res => setWorkoutPlanPresets(res))
             .catch(err => console.log(err)) */
    }, [])


    return (
        <>
            <div>
                <h1 className='text-2xl pb-5'>תבניות אימון</h1>
                {exercisePresets &&
                    <TemplateTabs tabs={tabs} />
                }
            </div>

        </>
    )
}

export default WorkoutsTemplatePage
