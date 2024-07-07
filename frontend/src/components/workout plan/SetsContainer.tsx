import React, { useContext, useEffect, useState } from 'react'
import SetsInput from './SetsInput'
import { ISet } from '@/interfaces/IWorkoutPlan';
import AddButton from './buttons/AddButton';
import DeleteButton from './buttons/DeleteButton';
import { editableContext } from './CreateWorkoutPlan';

interface SetContainerProps {
    updateSets: (componentSets: ISet[]) => void;
    existingSets?: ISet[]
}

const SetsContainer: React.FC<SetContainerProps> = ({ updateSets, existingSets }) => {

    const { isEdit } = useContext(editableContext)

    const [componentSets, setComponentSets] = useState<ISet[]>(existingSets ? existingSets : [{
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
            return prevSets.map(set => {
                if (set.id == index) {
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
        <div>
            {componentSets.map((set, i) => (
                <div
                    key={set.id}
                    className='flex gap-5  p-2 border-t-2 items-end'
                >
                    <SetsInput
                        setNumber={i + 1}
                        handleChange={(e) => handleChange(e, set.id)}
                        maxReps={set.maxReps}
                        minReps={set.minReps}
                    />
                    {isEdit &&
                        <DeleteButton tip='הסר סט' onClick={() => removeSet(set.id)} />
                    }
                </div>
            ))}
            {isEdit &&
                <AddButton tip='הוסף סט' onClick={createSet} />
            }
        </div>
    )
}

export default SetsContainer
