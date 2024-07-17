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
import { useNavigate } from 'react-router-dom';

interface TableActionsProps {
    handleDelete: () => void;
    endPoint: string
}


const TableActions: React.FC<TableActionsProps> = ({ handleDelete, endPoint }) => {

    const navigate = useNavigate();

    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger className='hover:bg-accent p-2 rounded-lg'>
                <BsThreeDots />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className='font-bold'>פעולות</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => navigate(endPoint)}
                >עריכה</DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                >מחיקה</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}

export default TableActions
