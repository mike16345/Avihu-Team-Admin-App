import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateUser = (id: string) => {
  const { updateUser } = useUsersApi();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    toast.success(`משתמש נשמר בהצלחה!`);
    // Invalidate BOTH the specific user query AND the full users
    // list. Without invalidating the list, the users store keeps
    // serving the pre-edit version — which means status changes
    // (e.g. marking a user as "disabled") don't propagate to the
    // home-dashboard "לבדיקה" / "ללא אימון" / "ללא תזונה" filters,
    // and the user keeps showing up there until the cache stale
    // time expires (an hour by default).
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS, id] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
    // Also bust the analytics caches that drive the dashboard
    // cards — they may be holding a stale snapshot that still
    // lists the user.
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS_TO_CHECK] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.NO_WORKOUT_PLAN] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.NO_DIET_PLAN] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPIRING_USERS] });
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.data.message });
  };

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: IUser }) => updateUser(id, user),
    onSuccess,
    onError,
  });
};

export default useUpdateUser;
