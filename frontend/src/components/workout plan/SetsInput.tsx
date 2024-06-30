import React from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SetInputProps {
    setNumber: number;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxReps?: number;
    minReps: number;
}


const SetsInput: React.FC<SetInputProps> = ({ setNumber, handleChange, maxReps, minReps }) => {
    return (
        <div className='flex items-center gap-5'>
            <div>
                סט {setNumber}
            </div >
            <div>
                <Label>מינימום חזרות</Label>
                <Input
                    name="minReps"
                    type='number'
                    min={0}
                    className='w-24'
                    placeholder="8/10/12..."
                    value={minReps}
                    onChange={(e) => handleChange(e)}
                />
            </div>
            <div>
                <Label>מקסימום חזרות</Label>
                <Input
                    name="maxReps"
                    type='number'
                    className='w-24'
                    min={0}
                    placeholder="8/10/12..."
                    value={maxReps}
                    onChange={(e) => handleChange(e)}
                />
            </div>
        </div>
    )
}

export default SetsInput
