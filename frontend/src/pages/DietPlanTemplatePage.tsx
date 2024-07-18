import TemplateTabs from '@/components/templates/TemplateTabs';
import { carbMenuItems, fatsMenuItems, proteinMenuItems, veggatableMenuItems } from '@/constants/TempDietPresetConsts';
import { IMenue, IMenuItem } from '@/interfaces/IDietPlan';
import React, { useState } from 'react'





const DietPlanTemplatePage = () => {

    const [proteinMenuState, setProteinMenuState] = useState<IMenuItem[]>(proteinMenuItems);
    const [carbsMenuState, setCarbsMenuState] = useState<IMenuItem[]>(carbMenuItems);
    const [VegetableMenuState, setVegetableMenuState] = useState<IMenuItem[]>(veggatableMenuItems);
    const [fatsMenueState, setFatsMenueState] = useState<IMenuItem[]>(fatsMenuItems);

    const tabs: ITabs = {
        tabHeaders: [
            {
                name: `חלבונים`,
                value: `proteinItems`
            },
            {
                name: `פחמימות`,
                value: `carbItems`
            },
            {
                name: `ירקות`,
                value: `vegetableItems`
            },
            {
                name: `שומנים`,
                value: `fatsItems`
            },
        ],
        tabContent: [
            {
                value: `proteinItems`,
                navURL: `/workoutPlans/presets/workout-template`,
                btnPrompt: `הוסף חלבון`,
                state: proteinMenuState,
                setter: setProteinMenuState,
                endPoint: `/workoutPlans/presets/workout-template`
            },
            {
                value: `carbItems`,
                navURL: `/workoutPlans/presets/workout-template`,
                btnPrompt: `הוסף פחמימה`,
                state: carbsMenuState,
                setter: setCarbsMenuState,
                endPoint: `/workoutPlans/presets/workout-template`
            },
            {
                value: `vegetableItems`,
                navURL: `/workoutPlans/presets/workout-template`,
                btnPrompt: `הוסף ירקות`,
                state: VegetableMenuState,
                setter: setVegetableMenuState,
                endPoint: `/workoutPlans/presets/workout-template`
            },
            {
                value: `fatsItems`,
                navURL: `/workoutPlans/presets/workout-template`,
                btnPrompt: `הוסף שומנים`,
                state: fatsMenueState,
                setter: setFatsMenueState,
                endPoint: `/workoutPlans/presets/workout-template`
            },
        ]
    }


    return (
        <div>
            <TemplateTabs tabs={tabs} />
        </div>
    )
}

export default DietPlanTemplatePage
