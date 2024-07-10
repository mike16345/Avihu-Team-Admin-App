import { WeightChart } from "./WeightChart";
import { WeightCalendar } from "./WeightCalendar";
import { Card, CardContent } from "../ui/card";

export const WeightProgression = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="size-full flex items-center gap-12">
        <WeightCalendar />
        <WeightChart />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg">תמונות</h1>
        <div className="flex items-center gap-8 border p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card>
              <CardContent>
                <img
                  className="object-cover w-full h-48"
                  src={`/images/weight-chart-${i}.png`}
                  alt={`Weight chart ${i}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
