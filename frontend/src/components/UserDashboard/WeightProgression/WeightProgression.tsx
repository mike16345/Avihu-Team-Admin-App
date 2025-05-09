import { WeightChart } from "./WeightChart";
import { WeightCalendar } from "./WeightCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useWeighInsApi } from "@/hooks/api/useWeighInsApi";
import { useParams } from "react-router";
import { CurrentWeighIn } from "./CurrentWeighIn";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { HOUR_STALE_TIME } from "@/constants/constants";
import { createRetryFunction } from "@/lib/utils";
import { QueryKeys } from "@/enums/QueryKeys";
import { WeightProgressionPhotos } from "./WeightProgressionPhotos";

export const WeightProgression = () => {
  const { id } = useParams();

  const { getWeighInsByUserId } = useWeighInsApi();

  const { data, error, isLoading } = useQuery({
    queryKey: [QueryKeys.WEIGH_INS + id],
    staleTime: HOUR_STALE_TIME * 6,
    enabled: !!id,
    queryFn: () => getWeighInsByUserId(id!),
    retry: createRetryFunction(404),
  });

  if (isLoading) return <Loader size="large" />;
  if (error && error?.status !== 404) return <ErrorPage message={error} />;
  const weighIns = data || [];

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="size-full flex items-center ">
          {!!weighIns?.length && (
            <Card className="size-full">
              <CardHeader>
                <CardTitle>מעקב שקילה</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col  gap-2">
                <div className="flex flex-col items-center lg:flex-row gap-2">
                  <WeightCalendar weighIns={weighIns} />
                  <WeightChart weighIns={weighIns} />
                </div>
                <CurrentWeighIn weighIn={weighIns[weighIns.length - 1]} />
              </CardContent>
            </Card>
          )}
          {weighIns?.length == 0 && (
            <div className="size-full">
              <h1 className="text-center">אין מעקב שקילה</h1>
            </div>
          )}
        </div>

        <WeightProgressionPhotos />
      </div>
    </>
  );
};
