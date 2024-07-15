import React, { useEffect, useState } from 'react'
import SetsInput from './SetsInput'
import { ISet } from '@/interfaces/IWorkoutPlan';
import AddButton from './buttons/AddButton';
import DeleteButton from './buttons/DeleteButton';
import { useIsWorkoutEditable } from '@/store/isWorkoutEditableStore';

interface SetContainerProps {
    updateSets: (componentSets: ISet[]) => void;
    existingSets?: ISet[]
}

const SetsContainer: React.FC<SetContainerProps> = ({ updateSets, existingSets }) => {

    const isEditable = useIsWorkoutEditable((state) => state.isEditable)


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

        setComponentSets((prevSets: ISet[]) => {
            return prevSets.map((set,i) => {
                if (i == index) {
                    return {
                        ...set,
                        [name]: value
                    }
                }
                return set
            })
        })
    }

    const createSet = () => {
        const newSet: ISet = {
            id: componentSets.length + 1,
            minReps: 0,
            maxReps: 0
        }
        setComponentSets([...componentSets, newSet])
    }

    const removeSet = (setId: number) => {
        console.log(setId);

        const filteredArr = componentSets.filter(set => set.id !== setId);
        const newArr = filteredArr.map((set, i) => ({ ...set, id: i + 1 }));

        setComponentSets(newArr)

    }

    useEffect(() => {
        updateSets(componentSets)
    }, [componentSets])

    return (
        <div className='border-y-2'>
            <h2
                className='underline font-bold pr-4 pt-2'
            >סטים:</h2>
            {componentSets.map((set, i) => (
                <div
                    key={i}
                    className='flex gap-5  p-2 items-end'
                >
                    <SetsInput
                        setNumber={i + 1}
                        handleChange={(e) => handleChange(e, i)}
                        maxReps={set.maxReps}
                        minReps={set.minReps}
                    />
                    {isEditable &&
                        <DeleteButton tip='הסר סט' onClick={() => removeSet(set.id)} />
                    }
                </div>
            ))}
            {isEditable &&
                <div className='w-[80%]'>
                    <AddButton tip='הוסף סט' onClick={createSet} />
                </div>
            }
        </div>
    )
}

export default SetsContainer
