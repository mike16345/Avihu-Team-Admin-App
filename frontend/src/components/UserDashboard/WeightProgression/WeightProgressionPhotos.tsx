import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React from "react";
import img1 from "@/assets/Progress/20240213_200035.jpg";
import img2 from "@/assets/Progress/20240213_200044.jpg";

const imgs = [img1, img2];

export const WeightProgressionPhotos = () => {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader className="text-lg font-semibold">
        <CardTitle>תמונות</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 rounded ">
        {imgs.map((img, i) => (
          <Card key={i}>
            <img className="object-fit p-2 w-full h-[400px] " src={img} alt={`Weight chart ${i}`} />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
