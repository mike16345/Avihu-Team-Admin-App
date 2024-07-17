import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BsThreeDots } from "react-icons/bs";


const TableActions = () => {
    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger className='hover:bg-accent p-2 rounded-lg'>
                <BsThreeDots />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className='font-bold'>פעולות</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>עריכה</DropdownMenuItem>
                <DropdownMenuItem>מחיקה</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}

export default TableActions
