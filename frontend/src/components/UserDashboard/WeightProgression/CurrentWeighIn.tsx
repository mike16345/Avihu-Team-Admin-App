import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IWeighIn } from "@/interfaces/IWeighIns";
import DateUtils from "@/lib/dateUtils";
import { poundsToKg } from "@/lib/workoutUtils";
import { TrendingDown } from "lucide-react";
import { FC } from "react";

interface CurrentWeighInProps {
  weighIn: IWeighIn;
}

export const CurrentWeighIn: FC<CurrentWeighInProps> = ({ weighIn }) => {
  if (!weighIn) return;
  const convertedDate = DateUtils.convertToDate(weighIn.date);
  const date = DateUtils.formatDate(convertedDate, "DD/MM/YYYY");

  return (
    <Card className="bg-accent w-full  xs:w-1/2 lg:w-1/4  text-accent-foreground">
      <CardHeader>
        <CardTitle>משקל הנוכחי</CardTitle>
        <CardDescription>הקלטה: {date}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 ">
          <p className=" text-lg text-success font-bold"> {poundsToKg(weighIn.weight)}</p>
          <TrendingDown />
        </div>
      </CardContent>
    </Card>
  );
};
