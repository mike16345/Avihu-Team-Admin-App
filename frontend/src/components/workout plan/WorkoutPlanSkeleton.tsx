import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

export const WorkoutPlanSkeletonCard = () => {
  return (
    <Card className=" px-3 py-2 border-b-2 last:border-b-0  max-h-[550px] overflow-y-auto custom-scrollbar">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-6" />
          </div>
          <Skeleton className="w-2/4 h-8" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-8 ">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/4 " />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8 " />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8 " />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8 " />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-8 " />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-20 w-48" />
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="justify-end">
        <Button>הוסף תרגיל</Button>
      </CardFooter> */}
    </Card>
  );
};
