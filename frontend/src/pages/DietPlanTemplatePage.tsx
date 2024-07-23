import TemplateTabs from '@/components/templates/TemplateTabs';
import { carbMenuItems, fatsMenuItems, proteinMenuItems, veggatableMenuItems } from '@/constants/TempDietPresetConsts';
import useMenuItemApi from '@/hooks/useMenuItemApi';
import { IMenue, IMenuItem } from '@/interfaces/IDietPlan';
import React, { useEffect, useState } from 'react'





const DietPlanTemplatePage = () => {

    const { getMenuItems, deleteMenuItem } = useMenuItemApi()

    const [proteinMenuState, setProteinMenuState] = useState<IMenuItem[]>();
    const [carbsMenuState, setCarbsMenuState] = useState<IMenuItem[]>();
    const [VegetableMenuState, setVegetableMenuState] = useState<IMenuItem[]>();
    const [fatsMenueState, setFatsMenueState] = useState<IMenuItem[]>();

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
                state: proteinMenuState || [],
                deleter: deleteMenuItem,
            },
            {
                value: `carbItems`,
                navURL: `/dietPlans/presets/carbs`,
                btnPrompt: `הוסף פחמימה`,
                state: carbsMenuState || [],
                deleter: deleteMenuItem,
            },
            {
                value: `vegetableItems`,
                navURL: `/dietPlans/presets/vegetables`,
                btnPrompt: `הוסף ירקות`,
                state: VegetableMenuState || [],
                deleter: deleteMenuItem,
            },
            {
                value: `fatsItems`,
                navURL: `/dietPlans/presets/fats`,
                btnPrompt: `הוסף שומנים`,
                state: fatsMenueState || [],
                deleter: deleteMenuItem,
            },
        ]
    }

    useEffect(() => {
        getMenuItems(`protein`)
            .then(res => setProteinMenuState(res))
            .catch(err => console.log(err))
        getMenuItems(`carbs`)
            .then(res => setCarbsMenuState(res))
            .catch(err => console.log(err))
        getMenuItems(`vegetables`)
            .then(res => setVegetableMenuState(res))
            .catch(err => console.log(err))
        getMenuItems(`fats`)
            .then(res => setFatsMenueState(res))
            .catch(err => console.log(err))
    }, [])




    return (
        <div>
            <h1 className='text-2xl pb-5'>תפריטים</h1>
            {fatsMenuItems && proteinMenuState && carbsMenuState && VegetableMenuState &&
                <TemplateTabs tabs={tabs} />
            }
        </div>
    )
}

export default DietPlanTemplatePage
