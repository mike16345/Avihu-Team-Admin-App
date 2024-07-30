import React from 'react'
import { FiAlertOctagon } from "react-icons/fi";

interface ErrorPageProps{
    message?:string
}

const ErrorPage:React.FC<ErrorPageProps> = ({message}) => {
  return (
    <div className='w-full h-full flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
        <FiAlertOctagon className='text-destructive animate-pulse'size={80} />
        <h1 className='text-3xl font-bold'>אופס, נתקלנו בבעיה!</h1>
        <h2 className='text-xl'>{message||``}</h2>
        </div>
    </div>
  )
}

export default ErrorPage
