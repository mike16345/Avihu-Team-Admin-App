import React from 'react'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SetInputProps{
    handleChange:(e:React.ChangeEvent<HTMLInputElement>)=>void
}


const SetsInput:SetInputProps = ({handleChange}) => {
    return (
        <div className='flex items-center gap-5'>
            <div>
                סט
            </div >
            <div>
                <Label>מינימום חזרות</Label>
                <Input
                    name="minReps"
                    placeholder="8/10/12..."
                    onChange={(e) => handleChange(e)}
                />
            </div>
            <div>
                <Label>מקסימום חזרות</Label>
                <Input
                    name="maxReps"
                    placeholder="8/10/12..."
                    onChange={(e) => handleChange(e)}
                />
            </div>
        </div>
    )
}

export default SetsInput
