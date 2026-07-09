import queryClient from "@/QueryClient/queryClient";
import { clearAuthSession } from "@/services/authSession";
import { useUsersStore } from "@/store/userStore";
import { toast } from "sonner";

let logoutPromise: Promise<void> | null = null;

export const clearLocalAuthState = async () => {
  useUsersStore.getState().setCurrentUser(null);
  await clearAuthSession();
  queryClient.clear();
};

export const forceLogoutFromAuthError = async () => {
  if (logoutPromise) {
    return logoutPromise;
  }

  logoutPromise = (async () => {
    try {
      await clearLocalAuthState();
      toast.error("נא ליכנס שוב.");
    } finally {
      logoutPromise = null;
    }
  })();

  return logoutPromise;
};
