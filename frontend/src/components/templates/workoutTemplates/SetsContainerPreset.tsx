import AddButton from '@/components/workout plan/buttons/AddButton';
import DeleteButton from '@/components/workout plan/buttons/DeleteButton';
import { ISet } from '@/interfaces/IWorkoutPlan';
import React, { useState } from 'react'
import SetsInputPreset from './SetsInputPreset';

interface SetContainerPresetProps {
    updateSets: (componentSets: ISet[]) => void;
    existingSets?: ISet[]
}

const SetsContainerPreset: React.FC<SetContainerPresetProps> = ({ updateSets, existingSets }) => {

    const [componentSets, setComponentSets] = useState<ISet[]>(existingSets || [{
        id: 1,
        minReps: 0,
        maxReps: 0,
    }])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const { name, value } = e.target;

        const updatedSets = componentSets.map((set, i) => {
            if (i === index) {
                return {
                    ...set,
                    [name]: value
                }
            }
            return set
        })

        setComponentSets(updatedSets)
        updateSets(updatedSets)
    }

    const createSet = () => {
        const newSet: ISet = {
            id: componentSets.length + 1,
            minReps: 0,
            maxReps: 0
        }
        setComponentSets([...componentSets, newSet])
        updateSets([...componentSets, newSet])
    }

    const removeSet = (index: number) => {

        const filteredArr = componentSets.filter((_, i) => i !== index);
        const newArr = filteredArr.map((set, i) => ({ ...set, id: i + 1 }));

        setComponentSets(newArr)
        updateSets(newArr)

    }


    return (
        <div className='border-y-2'>
            <h2
                className='underline font-bold pr-4 pt-2'
            >סטים:</h2>
            {componentSets.map((set, i) => (
                <div
                    key={i}
                    className='flex gap-5 w-[50%] p-2 items-end'
                >
                    <SetsInputPreset
                        setNumber={i + 1}
                        handleChange={(e) => handleChange(e, i)}
                        maxReps={set.maxReps}
                        minReps={set.minReps}
                    />
                    <div onClick={() => removeSet(i)}>
                        <DeleteButton tip='הסר סט' />
                    </div>
                </div>
            ))}
            <div className='w-[80%]'>
                <AddButton tip='הוסף סט' onClick={createSet} />
            </div>
        </div>
    )
}

export default SetsContainerPreset