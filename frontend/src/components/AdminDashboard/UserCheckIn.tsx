import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { useNavigate } from "react-router-dom";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { Badge } from "../ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorPage from "@/pages/ErrorPage";
import {
  FULL_DAY_STALE_TIME,
  MIN_STALE_TIME,
  ONE_MIN_IN_MILLISECONDS,
} from "@/constants/constants";

const UserCheckIn = () => {
  const navigate = useNavigate();
  const { getAllCheckInUsers, checkOffUser } = useAnalyticsApi();
  const queryClient = useQueryClient();

  // Fetching all users to check in
  const {
    isLoading,
    isError,
    error,
    data: users,
  } = useQuery({
    queryKey: ["usersToCheck"],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: getAllCheckInUsers,
  });

  const mutation = useMutation({
    mutationFn: (id: string) => checkOffUser(id).then((res) => res.data),
    onSuccess: (data) => {
      toast.success(`משתמש סומן בהצלחה!`);
      queryClient.setQueryData<UsersCheckIn[] | undefined>(
        ["usersToCheck"],
        (oldData) => oldData?.filter((user) => user._id !== data._id) ?? []
      );
    },
    onError: (err: any) => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: err.response?.data?.message || "An error occurred",
      });
    },
  });

  const handleCheckChange = (id: string) => {
    mutation.mutate(id);
  };

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <Card dir="rtl" className="w-full shadow-md py-5">
      <CardHeader>
        <CardTitle>לקוחות לבדיקה</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[40vh] overflow-y-auto border-y-2">
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
        {users?.length === 0 && (
          <div className="h-24 flex items-center justify-center">
            <h2 className="font-bold text-success">לא נשארו לקוחות לבדיקה!</h2>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCheckIn;
