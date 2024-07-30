import React from 'react'
import { Skeleton } from '../skeleton'

const TemplateTabsSkeleton = () => {
  return (
    <div>
      <Skeleton className='h-10 w-72 mt-10'/>
      <Skeleton className='h-8 w-28 mt-5'/>
      <Skeleton className='h-8 w-72 mt-10'/>
      <Skeleton className='h-10 w-[500px] mt-7'/>
      <Skeleton className='h-10 w-[500px] mt-4'/>
      <Skeleton className='h-10 w-[500px] mt-4'/>
      <Skeleton className='h-10 w-[500px] mt-4'/>
      <Skeleton className='h-10 w-[500px] mt-4'/>
    </div>
  )
}

export default TemplateTabsSkeleton
