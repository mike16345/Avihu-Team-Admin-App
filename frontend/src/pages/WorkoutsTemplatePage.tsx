import TemplateTabs from '@/components/templates/TemplateTabs'
import TemplateTabsSkeleton from '@/components/ui/skeletons/TemplateTabsSkeleton'
import useExercisePresetApi from '@/hooks/useExercisePresetApi'
import useMuscleGroupsApi from '@/hooks/useMuscleGroupsApi'
import { useWorkoutPlanPresetApi } from '@/hooks/useWorkoutPlanPresetsApi'
import {  IExercisePresetItem, IMuscleGroupItem, IWorkoutPlanPreset, } from '@/interfaces/IWorkoutPlan'
import React, { useEffect, useState } from 'react'

const WorkoutsTemplatePage = () => {

    const { getExercisePresets, deleteExercise } = useExercisePresetApi()
    const { getAllWorkoutPlanPresets, deleteWorkoutPlanPreset } = useWorkoutPlanPresetApi()
    const { getAllMuscleGroups, deleteMuscleGroup } = useMuscleGroupsApi()

    const [workoutPlanPresets, setWorkoutPlanPresets] = useState<IWorkoutPlanPreset[]>()
    const [musclegroupState, setMusclegroupState] = useState<IMuscleGroupItem[]>()
    const [exercisePresets, setExercisePresets] = useState<IExercisePresetItem[]>()
    const [isLoading,setIsLoading]=useState<boolean>(false)


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
                btnPrompt: `הוסף תבנית`,
                state: workoutPlanPresets,
                sheetForm: `workoutPlan`,
                deleteFunc: deleteWorkoutPlanPreset
            },
            {
                value: `muscleGroups`,
                btnPrompt: `הוסף קבוצת שריר`,
                state: musclegroupState,
                sheetForm: `muscleGroup`,
                deleteFunc: deleteMuscleGroup
            },
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
        setIsLoading(true)
        getExercisePresets()
            .then(res => setExercisePresets(res))
            .catch(err => console.log(err))

        getAllWorkoutPlanPresets()
            .then(res => setWorkoutPlanPresets(res))
            .catch(err => console.log(err))
        getAllMuscleGroups()
            .then(res => setMusclegroupState(res))
            .catch(err => console.log(err))

            setTimeout(()=>{
                setIsLoading(false)
            },1500)
    }, [])

    if (isLoading) return <TemplateTabsSkeleton/>

    return (
        <>
            <div>
                <h1 className='text-2xl pb-5'>תבניות אימון</h1>
                {exercisePresets && workoutPlanPresets && musclegroupState &&
                    <TemplateTabs tabs={tabs} />
                }
            </div>

        </>
    )
}

export default WorkoutsTemplatePage
