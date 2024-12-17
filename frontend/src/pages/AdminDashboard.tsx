import AnalyticsCard from "@/components/AdminDashboard/AnalyticsCard";
import Shortcut from "@/components/AdminDashboard/Shortcut";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import GenericCarousel from "@/components/ui/GenericCarousel";
import { QueryKeys } from "@/enums/QueryKeys";
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
    navLink: `/blogs/create`,
    icon: <MdOutlinePostAdd />,
  },
];

const AdminDashboard = () => {
  return (
    <div className="size-full">
      <h1 className="text-4xl font-bold">עמוד מאמן</h1>
      <div className="flex flex-col pt-4 gap-2">
        <h2 className="font-bold text-xl">פעולות מהירות</h2>
        <div className="flex flex-wrap items-center gap-5">
          {shortcuts.map((item) => (
            <div key={item.navLink} className="flex justify-center items-center ">
              <Shortcut actionName={item.actionName} icon={item.icon} navLink={item.navLink} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-4">
        <UserCheckIn />

        <div className="px-8 ">
          <GenericCarousel
            carouselItems={[
              <AnalyticsCard title="לקוחות ללא תוכנית אימון" dataKey={QueryKeys.NO_WORKOUT_PLAN} />,
              <AnalyticsCard title="לקוחות ללא תפריט תזונה" dataKey={QueryKeys.NO_DIET_PLAN} />,
              <AnalyticsCard
                title="לקוחות שמסיימים תהליך החודש"
                dataKey={QueryKeys.EXPIRING_USERS}
              />,
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
