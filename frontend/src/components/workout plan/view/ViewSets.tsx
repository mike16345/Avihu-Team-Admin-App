import { ISet } from '@/interfaces/IWorkoutPlan'
import React from 'react'

interface ViewSetsProps {
    set: ISet,
    num: number,
    editable: boolean
}

const ViewSets: React.FC<ViewSetsProps> = ({ set, num, editable }) => {
    const { minReps, maxReps } = set
    return (
        <div>
            <table className='w-full'>
                <thead>
                    <tr>
                        <th className='th'>#</th>
                        <th className='th'>מינימום חזרות</th>
                        <th className='th'>מקסימום חזרות</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td
                            className='td'
                            contentEditable={editable}
                        >סט {num + 1}</td>
                        <td
                            className='td'
                            contentEditable={editable}
                        >{minReps}</td>
                        <td
                            className='td'
                            contentEditable={editable}
                        >{maxReps}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default ViewSets
