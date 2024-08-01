import TemplateTabs from '@/components/templates/TemplateTabs';
import { useDietPlanPresetApi } from '@/hooks/useDietPlanPresetsApi';
import useMenuItemApi from '@/hooks/useMenuItemApi';
import { IDietPlan, IMenuItem } from '@/interfaces/IDietPlan';
import React, { useEffect, useState } from 'react'





const DietPlanTemplatePage = () => {

    const { getMenuItems, deleteMenuItem } = useMenuItemApi()
    const{getAllDietPlanPresets, deleteDietPlanPreset}=useDietPlanPresetApi()

    const [dietPlanPresetsState, setDietPlanPresetsState] = useState<IDietPlan[]>();
    const [proteinMenuState, setProteinMenuState] = useState<IMenuItem[]>();
    const [carbsMenuState, setCarbsMenuState] = useState<IMenuItem[]>();
    const [VegetableMenuState, setVegetableMenuState] = useState<IMenuItem[]>();
    const [fatsMenueState, setFatsMenueState] = useState<IMenuItem[]>();

    const tabs: ITabs = {
        tabHeaders: [
            {
                name: `תפריטים`,
                value: `dietPlanPresets`
            },
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
                value: `dietPlanPresets`,
                btnPrompt: `הוסף תפריט`,
                state: dietPlanPresetsState || [],
                sheetForm: `dietPlans`,
                deleteFunc: deleteDietPlanPreset
            },
            {
                value: `proteinItems`,
                btnPrompt: `הוסף חלבון`,
                state: proteinMenuState || [],
                sheetForm: `protein`,
                deleteFunc: deleteMenuItem
            },
            {
                value: `carbItems`,
                btnPrompt: `הוסף פחמימה`,
                state: carbsMenuState || [],
                sheetForm: `carbs`,
                deleteFunc: deleteMenuItem
            },
            {
                value: `vegetableItems`,
                btnPrompt: `הוסף ירקות`,
                state: VegetableMenuState || [],
                sheetForm: `vegetables`,
                deleteFunc: deleteMenuItem
            },
            {
                value: `fatsItems`,
                btnPrompt: `הוסף שומנים`,
                state: fatsMenueState || [],
                sheetForm: `fats`,
                deleteFunc: deleteMenuItem
            },
        ]
    }

    useEffect(() => {
        getAllDietPlanPresets()
        .then(res=>setDietPlanPresetsState(res))
        .catch(err=>console.log(err))
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
            {fatsMenueState && proteinMenuState && carbsMenuState && VegetableMenuState && dietPlanPresetsState &&
                <TemplateTabs tabs={tabs} />
            }
        </div>
    )
}

export default DietPlanTemplatePage
