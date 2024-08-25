import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { useNavigate } from "react-router-dom";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { BiCheckSquare } from "react-icons/bi";
import { Badge } from "../ui/badge";

const UserCheckIn = () => {
  const navigate = useNavigate();
  const { getAllCheckInUsers, checkOffUser } = useAnalyticsApi();

  const [users, setUsers] = useState<UsersCheckIn[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckChange = (id: string) => {
    if (!users) return;
    checkOffUser(id)
      .then(() => {
        toast.success(`משתמש סומן בהצלחה!`);

        const newUsers = users.filter((user) => user._id !== id);

        setUsers(newUsers);
      })
      .catch((err) =>
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: err.response.data.message,
        })
      );
  };

  useEffect(() => {
    setIsLoading(true);
    getAllCheckInUsers()
      .then((res) => setUsers(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card dir="rtl" className="sm:w-full md:w-[60%] lg:w-[40%] shadow-md py-5">
      <CardHeader>
        <CardTitle>לקוחות לבדיקה</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[40vh] overflow-y-auto  border-y-2">
        {isLoading && <Loader size="large" />}
        {users?.map((user) => (
          <div
            key={user._id}
            className="w-full flex justify-between items-center border-b-2 p-5 hover:bg-accent"
          >
            <div
              className="flex gap-5 hover:underline cursor-pointer"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              <h2>{user.firstName}</h2>
              <h2>{user.lastName}</h2>
            </div>
            <Badge
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleCheckChange(user._id);
              }}
            >
              נבדק
            </Badge>
          </div>
        ))}
        {users?.length == 0 && (
          <div className="h-24 flex items-center justify-center">
            <h2 className="font-bold text-success">לא נשארו לקוחות לבדיקה!</h2>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCheckIn;
