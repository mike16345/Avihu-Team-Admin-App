import React from 'react'
import ComboBox from './ComboBox'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"



const ExcerciseInput = ({ options, setter }) => {
    return (
        <div className='border-b-2 py-2'>
            <ComboBox options={options} setter={setter} />
            <div>
                <Label>סטים</Label>
                <Input
                    placeholder='1/2/3/4...'
                />
                <Label>חזרות</Label>
                <Input
                    placeholder='8/10/12...'
                />
                <Label>משקל</Label>
                <Input
                    placeholder='KG'
                />
            </div>
        </div>
    )
}

export default ExcerciseInput
