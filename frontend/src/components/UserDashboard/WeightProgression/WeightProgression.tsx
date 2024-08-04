import { WeightChart } from "./WeightChart";
import { WeightCalendar } from "./WeightCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useEffect, useState } from "react";
import { IWeighIn } from "@/interfaces/IWeighIns";
import { useWeighInsApi } from "@/hooks/useWeighInsApi";
import { useParams } from "react-router";
import { CurrentWeighIn } from "./CurrentWeighIn";
import { WeightProgressionPhotos } from "./WeightProgressionPhotos";

export const WeightProgression = () => {
  const { id } = useParams();

  const { getWeighInsByUserId } = useWeighInsApi();
  const [weighIns, setWeighIns] = useState<IWeighIn[] | null>();

  useEffect(() => {
    if (!id) return;

    getWeighInsByUserId(id)
      .then((res) => {
        setWeighIns(res);
      })
      .catch((err) => console.error("err", err));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full h-full flex items-center ">
        {weighIns && (
          <Card className="size-full">
            <CardHeader>
              <CardTitle>מעקב שקילה</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col  gap-2">
              <div className="flex flex-col xl:flex-row gap-2">
                <WeightCalendar weighIns={weighIns} />
                <WeightChart weighIns={weighIns} />
              </div>
              <CurrentWeighIn weighIn={weighIns[weighIns.length - 1]} />
            </CardContent>
          </Card>
        )}
      </div>

      <WeightProgressionPhotos />
    </div>
  );
};
