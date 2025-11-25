import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import React from "react";

interface WorkoutTabsProps {
  workoutPlan: React.ReactNode;
  cardioPlan: React.ReactNode;
  tips: React.ReactNode;
}

const WorkoutTabs: React.FC<WorkoutTabsProps> = ({ workoutPlan, cardioPlan, tips }) => {
  return (
    <Tabs defaultValue="workout" dir="rtl">
      <TabsList>
        <TabsTrigger value="workout">אימונים</TabsTrigger>
        <TabsTrigger value="cardio">אירובי</TabsTrigger>
        <TabsTrigger value="tips">דגשים</TabsTrigger>
      </TabsList>
      <TabsContent value="cardio">{cardioPlan}</TabsContent>
      <TabsContent value="workout">{workoutPlan}</TabsContent>
      <TabsContent value="tips">{tips}</TabsContent>
    </Tabs>
  );
};

export default WorkoutTabs;
