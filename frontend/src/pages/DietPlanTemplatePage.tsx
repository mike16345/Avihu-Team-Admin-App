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
                navURL: `/dietPlans/presets/protein`,
                btnPrompt: `הוסף חלבון`,
                state: proteinMenuState,
                setter: setProteinMenuState,
                endPoint: `/dietPlans/presets/protein`
            },
            {
                value: `carbItems`,
                navURL: `/dietPlans/presets/carbs`,
                btnPrompt: `הוסף פחמימה`,
                state: carbsMenuState,
                setter: setCarbsMenuState,
                endPoint: `/dietPlans/presets/carbs`
            },
            {
                value: `vegetableItems`,
                navURL: `/dietPlans/presets/vegetables`,
                btnPrompt: `הוסף ירקות`,
                state: VegetableMenuState,
                setter: setVegetableMenuState,
                endPoint: `/dietPlans/presets/vegetables`
            },
            {
                value: `fatsItems`,
                navURL: `/dietPlans/presets/vegetables`,
                btnPrompt: `הוסף שומנים`,
                state: fatsMenueState,
                setter: setFatsMenueState,
                endPoint: `/dietPlans/presets/vegetables`
            },
        ]
    }


    return (
        <div>
            <h1 className='text-2xl pb-5'>תפריטים</h1>
            <TemplateTabs tabs={tabs} />
        </div>
    )
}

export default DietPlanTemplatePage
