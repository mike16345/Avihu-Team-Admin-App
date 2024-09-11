import AnalyticsCard from "@/components/AdminDashboard/AnalyticsCard";
import Shortcut from "@/components/AdminDashboard/Shortcut";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import GenericCarousel from "@/components/ui/GenericCarousel";
import React from "react";
import { BiFoodMenu } from "react-icons/bi";
import { FaDumbbell } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { MdOutlinePostAdd } from "react-icons/md";

const shortcuts = [
  {
    actionName: `הוסף משתמש`,
    navLink: `/users/add`,
    icon: <FiUserPlus />,
  },
  {
    actionName: `הוסף תפריט`,
    navLink: `/presets/dietPlans`,
    icon: <BiFoodMenu />,
  },
  {
    actionName: `הוסף תבנית אימון`,
    navLink: `/presets/workoutPlans/`,
    icon: <FaDumbbell />,
  },
  {
    actionName: `הוסף פוסט`,
    navLink: `/blogs`,
    icon: <MdOutlinePostAdd />,
  },
];

const AdminDashboard = () => {
  return (
    <div className="size-full">
      <h1 className="text-2xl font-bold">Admin Page</h1>
      <h2 className="font-bold pt-2 text-lg">פעולות מהירות</h2>
      <div className="flex flex-wrap items-center justify-start  py-5 gap-5">
        {shortcuts.map((item, i) => (
          <div key={i} className="flex justify-center items-center ">
            <Shortcut actionName={item.actionName} icon={item.icon} navLink={item.navLink} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t-2 py-4">
        <UserCheckIn />

        <div className="px-5">
          <GenericCarousel
            carouselItems={[
              <AnalyticsCard title="לקוחות ללא תוכנית אימון" dataKey="workoutPlan" />,
              <AnalyticsCard title="לקוחות ללא תפריט תזונה" dataKey="dietPlan" />,
              <AnalyticsCard title="לקוחות שמסיימים תהליך החודש" dataKey="expiringUsers" />,
            ]}
          />
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
