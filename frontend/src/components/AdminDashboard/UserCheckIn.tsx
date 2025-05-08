import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { useNavigate } from "react-router-dom";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { FaCheck } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorPage from "@/pages/ErrorPage";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { weightTab } from "@/pages/UserDashboard";
import { QueryKeys } from "@/enums/QueryKeys";

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
    queryKey: [QueryKeys.USERS_TO_CHECK],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: getAllCheckInUsers,
  });

  const mutation = useMutation({
    mutationFn: (id: string) => checkOffUser(id).then((res) => res.data),
    onSuccess: (data) => {
      toast.success(`משתמש סומן בהצלחה!`);
      queryClient.setQueryData<UsersCheckIn[] | undefined>(
        [QueryKeys.USERS_TO_CHECK],
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
    <Card className=" shadow-md max-h-[75vh] overflow-y-auto  ">
      <CardHeader>
        <CardTitle>לקוחות לבדיקה</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Loader size="large" />}
        {users &&
          users?.map((user) => (
            <div
              key={user._id}
              onDoubleClick={() => navigate(`/users/${user._id}?tab=${weightTab}`)}
              className="w-full cursor-pointer flex  justify-between items-center border-b-2 p-3 hover:bg-accent"
            >
              <div className="flex items-center gap-1 ">
                <h2>{user.firstName}</h2>
                <h2>{user.lastName}</h2>
              </div>
              <div
                className="hover:opacity-40"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckChange(user._id);
                }}
              >
                <FaCheck className="text-success" />
              </div>
            </div>
          ))}
        {users?.length === 0 && (
          <div className="size-full flex items-center justify-center">
            <h2 className=" text-center text-xl  font-bold text-success">
              לא נשארו לקוחות לבדיקה!
            </h2>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCheckIn;
