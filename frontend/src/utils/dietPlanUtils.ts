import { IDietPlanPreset } from "@/interfaces/IDietPlan";

export function removeIdsAndVersions(obj:IDietPlanPreset) {
  if (Array.isArray(obj)) {
    return obj.map(item => removeIdsAndVersions(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (key !== '_id' && key !== '__v') {
        newObj[key] = removeIdsAndVersions(obj[key]);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}