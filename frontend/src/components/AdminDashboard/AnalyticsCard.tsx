import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IAanlyticsList {
  firstName: string;
  lastName: string;
  navLink: string;
}

interface AnalyticsCardProps {
  title: string;
  data: IAanlyticsList[];
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, data }) => {
  const navigate = useNavigate();
  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col max-h-64 overflow-y-auto border-y-2">
        {data.map((item, i) => (
          <div key={i} className="w-full flex items-center justify-between border-b-2">
            <div className="flex gap-5 items-center py-5 px-2">
              <p>{item.firstName}</p>
              <p>{item.lastName}</p>
            </div>
            <Button onClick={() => navigate(item.navLink)}>צפה</Button>
          </div>
        ))}
      </CardContent>
    </Card>

    /*  <div dir="rtl" className="w-full flex flex-col">
      <h2></h2>
      <div className="flex flex-col max-h-64 overflow-y-auto">
        
      </div>
    </div> */
  );
};

export default AnalyticsCard;
