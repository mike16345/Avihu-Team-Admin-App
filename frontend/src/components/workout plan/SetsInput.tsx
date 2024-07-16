import React, { useContext } from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { isEditableContext } from './CreateWorkoutPlan';

interface SetInputProps {
    setNumber: number;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxReps?: number;
    minReps: number;
}


const SetsInput: React.FC<SetInputProps> = ({ setNumber, handleChange, maxReps, minReps }) => {

    const isEditable = useContext(isEditableContext);

    return (
        <div className='flex items-end gap-5'>
            <div>
                סט {setNumber}
            </div >
            <div>
                <Label>מינימום חזרות</Label>
                {isEditable ?
                    <Input
                        readOnly={!isEditable}
                        name="minReps"
                        type='number'
                        min={0}
                        className='w-24'
                        placeholder="8/10/12..."
                        value={minReps}
                        onChange={(e) => handleChange(e)}
                    /> :
                    <p
                        className="py-1 border-b-2 text-center"
                    >{minReps}</p>
                }
            </div>
            <div>
                <Label>מקסימום חזרות</Label>
                {isEditable ?
                    <Input
                        readOnly={!isEditable}
                        name="maxReps"
                        type='number'
                        className='w-24'
                        min={0}
                        placeholder="8/10/12..."
                        value={maxReps}
                        onChange={(e) => handleChange(e)}
                    /> :
                    <p
                        className="py-1 border-b-2 text-center"
                    >{maxReps || `לא קיים`}</p>
                }
            </div>
        </div>
    )
}

export default SetsInput
