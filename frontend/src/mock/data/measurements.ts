/**
 * Mock measurements — היקפי גוף לכל מתאמן.
 */
import { IUserMuscleMeasurements } from "@/interfaces/measurements";

export const mockMeasurementsByUser: Record<string, IUserMuscleMeasurements> = {
  "mock-1": {
    _id: "msm-mock-1",
    userId: "mock-1",
    measurements: [
      { date: "05/05/2026", chest: 92, arm: 31, waist: 78, glutes: 96, thigh: 58, calf: 36 },
      { date: "12/05/2026", chest: 91, arm: 31, waist: 76, glutes: 95, thigh: 58, calf: 36 },
      { date: "19/05/2026", chest: 91, arm: 30.5, waist: 74, glutes: 94, thigh: 57, calf: 36 },
    ],
  },
  "mock-2": {
    _id: "msm-mock-2",
    userId: "mock-2",
    measurements: [
      { date: "12/03/2026", chest: 102, arm: 36, waist: 85, glutes: 102, thigh: 62, calf: 38 },
      { date: "12/04/2026", chest: 103, arm: 37, waist: 85.5, glutes: 103, thigh: 63, calf: 38.5 },
      { date: "12/05/2026", chest: 105, arm: 38, waist: 86, glutes: 104, thigh: 64, calf: 39 },
    ],
  },
};
