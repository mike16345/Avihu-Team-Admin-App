import DateUtils from "@/lib/dateUtils";
import { FC } from "react";
import { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface SetProgressTooltipProps {
  data: Payload<ValueType, NameType>;
}

export const SetProgressTooltip: FC<SetProgressTooltipProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-1 p-2">
      <span className="font-medium">
        אימון: <span className="font-normal text-muted-foreground">{data.payload.plan}</span>
      </span>
      <span className="font-medium">
        סט: <span className="font-normal text-muted-foreground">{data.payload.setNumber}</span>
      </span>
      <span className="font-medium">
        תאריך:{" "}
        <span className="font-normal text-muted-foreground">
          {DateUtils.formatDate(data.payload.date)}
        </span>
      </span>
    </div>
  );
};
