/**
 * Mock weigh-ins — שקילות לכל מתאמן.
 * הטיפוסים זהים לאלה שב-IWeighIns.ts.
 */
import { IWeighIns } from "@/interfaces/IWeighIns";

const generateWeighIns = (
  start: Date,
  startWeight: number,
  weeks: number,
  weeklyDelta: number
): IWeighIns["weighIns"] => {
  const out: IWeighIns["weighIns"] = [];
  for (let i = 0; i < weeks; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    // small random wobble
    const wobble = (i % 2 === 0 ? 0.2 : -0.15) * ((i % 3) + 1) * 0.1;
    out.push({
      date: d,
      weight: +(startWeight + weeklyDelta * i + wobble).toFixed(1),
    });
  }
  return out;
};

export const mockWeighInsByUser: Record<string, IWeighIns> = {
  "mock-1": {
    id: "wi-mock-1",
    userId: "mock-1",
    weighIns: generateWeighIns(new Date("2026-05-05"), 75.2, 5, -1.1),
  },
  "mock-2": {
    id: "wi-mock-2",
    userId: "mock-2",
    weighIns: generateWeighIns(new Date("2026-03-12"), 80.5, 13, +0.15),
  },
  "mock-3": {
    id: "wi-mock-3",
    userId: "mock-3",
    weighIns: generateWeighIns(new Date("2026-01-20"), 64.5, 20, -0.1),
  },
  "mock-4": {
    id: "wi-mock-4",
    userId: "mock-4",
    weighIns: generateWeighIns(new Date("2025-09-01"), 103.5, 26, -0.33),
  },
  "mock-5": {
    id: "wi-mock-5",
    userId: "mock-5",
    weighIns: generateWeighIns(new Date("2026-04-15"), 59.6, 6, -0.2),
  },
  "mock-6": {
    id: "wi-mock-6",
    userId: "mock-6",
    weighIns: generateWeighIns(new Date("2026-02-28"), 75.8, 14, +0.22),
  },
};
