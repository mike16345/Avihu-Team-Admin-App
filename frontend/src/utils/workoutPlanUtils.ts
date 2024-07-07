export function cleanWorkoutObject(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => cleanWorkoutObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const cleanedObject: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === 'id' || key === '_id') {
                    continue;
                } else if (key === 'maxReps' && obj[key] === 0) {
                    cleanedObject[key] = undefined;
                } else {
                    cleanedObject[key] = cleanWorkoutObject(obj[key]);
                }
            }
        }
        return cleanedObject;
    } else {
        return obj;
    }
}