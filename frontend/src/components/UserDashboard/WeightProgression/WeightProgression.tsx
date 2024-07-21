import { WeightChart } from "./WeightChart";
import { WeightCalendar } from "./WeightCalendar";
import { Card, CardContent } from "../../ui/card";
import { useEffect, useState } from "react";
import { IWeighIns } from "@/interfaces/IWeighIns";
import { useWeighInsApi } from "@/hooks/useWeighInsApi";
import { useParams } from "react-router";

export const WeightProgression = () => {
  const { id } = useParams();

  const { getWeighInsByUserId } = useWeighInsApi();
  const [weighIns, setWeighIns] = useState<IWeighIns | null>();

  useEffect(() => {
    if (!id) return;

    getWeighInsByUserId(id)
      .then((res) => {
        console.log("response ", res);
        setWeighIns(res);
      })
      .catch((err) => console.error("err", err));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full h-[400px] flex items-center gap-12">
        {weighIns && (
          <>
            <WeightCalendar weighIns={weighIns} />
            <WeightChart weighIns={weighIns} />
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">תמונות</h1>
        <div className="flex flex-wrap items-center  gap-4 border rounded px-2 py-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardContent>
                <img className="object-cover w-full h-48" alt={`Weight chart ${i}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
