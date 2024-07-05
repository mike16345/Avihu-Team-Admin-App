import { useUsersApi } from "@/hooks/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { useNavigate } from "react-router";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { getAllUsers } = useUsersApi();
  const { getDietPlanByUserId } = useDietPlanApi();

  const [users, setUsers] = useState<IUser[] | null>(null);

  useEffect(() => {
    getAllUsers()
      .then((users) => setUsers(users))
      .catch((error) => {
        console.error("error", error);
      });
  }, []);

  if (!users) {
    return "Loading...";
  }

  // Add route for diet plan without user id. For creating a new plan
  const handleViewUserDietPlan = (user: IUser) => {
    getDietPlanByUserId(user._id)
      .then((dietPlan) => {
        console.log("found diet plan", dietPlan);
        navigate(`/diet-plans/${user._id}`, { state: { dietPlan } });
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  return (
    <>
      <DataTableHebrew
        data={users}
        columns={userColumns}
        handleSetData={() => console.log("setting data")}
        handleViewData={(user) => handleViewUserDietPlan(user)}
        handleDeleteData={(user) => console.log("user to delete", user)}
        handleViewNestedData={(data, userId) => console.log("data user", data, userId)}
      />
    </>
  );
};
