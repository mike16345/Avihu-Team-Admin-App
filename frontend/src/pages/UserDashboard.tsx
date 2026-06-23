import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import {
  PlanTypeConfirmationModal,
  StatusConfirmationModal,
} from "@/components/UserDashboard/Profile/UserDashboardModals";
import { UserDashboardHeader } from "@/components/UserDashboard/Profile/UserDashboardHeader";
import { UserDashboardProfileTab } from "@/components/UserDashboard/Profile/UserDashboardProfileTab";
import {
  DietTabPanel,
  FormsTabPanel,
  ProgressTabPanel,
  WorkoutTabPanel,
} from "@/components/UserDashboard/Profile/UserDashboardTabPanels";
import { UserDashboardTabs } from "@/components/UserDashboard/Profile/UserDashboardTabs";
import type {
  MainTab,
  ProgressSubTab,
} from "@/components/UserDashboard/Profile/userDashboardTypes";
import {
  getDaysRemaining,
  getInitials,
  getStoredBaseStatus,
} from "@/components/UserDashboard/Profile/userDashboardStatus";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { tryGuardedNav } from "@/hooks/useNavigationBlocker";
import type { AccountStatus, IUser, IStatusHistoryEntry } from "@/interfaces/IUser";
import { deriveAccountStatus, hasContractEnded } from "@/lib/userStatus";
import { useUsersStore } from "@/store/userStore";
import ErrorPage from "./ErrorPage";

export const weightTab = "מעקב שקילה";
export const workoutTab = "מעקב אימון";
export const measurementTab = "מעקב היקפים";
export const formsTab = "שאלונים";

const isMainTab = (value: string | null): value is MainTab =>
  value === "profile" ||
  value === "progress" ||
  value === "workout" ||
  value === "diet" ||
  value === "forms";

const isProgressSub = (value: string | null): value is ProgressSubTab =>
  value === "weight" || value === "measurements" || value === "strength" || value === "photos";

export const UserDashboard = () => {
  const stateUser = useLocation().state as IUser | undefined;
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useUserQuery(id || "oneUser", !stateUser);
  const updateUser = useUpdateUser(id || "");
  const currentUserAuth = useUsersStore((state) => state.currentUser);
  const [searchParams, setSearchParams] = useSearchParams();

  const [mainTab, setMainTabState] = useState<MainTab>(() => {
    const tab = searchParams.get("tab");
    return isMainTab(tab) ? tab : "progress";
  });
  const [progressSub, setProgressSubState] = useState<ProgressSubTab>(() => {
    const subTab = searchParams.get("sub");
    return isProgressSub(subTab) ? subTab : "weight";
  });
  const [status, setStatus] = useState<AccountStatus>("active");
  const [pendingStatus, setPendingStatus] = useState<AccountStatus | null>(null);
  const [planType, setPlanType] = useState("");
  const [pendingPlanType, setPendingPlanType] = useState<string | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const autoDowngradeFiredRef = useRef<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (isMainTab(tab) && tab !== mainTab) setMainTabState(tab);

    const subTab = searchParams.get("sub");
    if (isProgressSub(subTab) && subTab !== progressSub) setProgressSubState(subTab);
  }, [mainTab, progressSub, searchParams]);

  useEffect(() => {
    const sourceUser = data || stateUser;
    setStatus(deriveAccountStatus(sourceUser));
    setPlanType(sourceUser?.planType || "");
  }, [data, stateUser]);

  // Persist the automatic active -> user downgrade once when an active contract is already over.
  useEffect(() => {
    const sourceUser = data || stateUser;
    if (!sourceUser?._id) return;
    if (autoDowngradeFiredRef.current === sourceUser._id) return;
    if (getStoredBaseStatus(sourceUser) !== "active") return;
    if (!hasContractEnded(sourceUser)) return;
    if (pendingStatus) return;

    autoDowngradeFiredRef.current = sourceUser._id;
    updateUser.mutate({
      id: sourceUser._id,
      user: {
        ...sourceUser,
        accountStatus: "user",
        hasAccess: true,
      } as IUser,
    });
  }, [data, stateUser, pendingStatus, updateUser]);

  if (isLoading) return <Loader size="large" />;
  if (isError && !data) return <ErrorPage message={error.message} />;

  const currentUser = data || stateUser;
  const initials = getInitials(currentUser?.firstName, currentUser?.lastName);
  const userName = `${currentUser?.firstName} ${currentUser?.lastName}`;

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    setSearchParams(params, { replace: true });
  };

  const setMainTab = (nextTab: MainTab) => {
    tryGuardedNav(() => {
      setMainTabState(nextTab);
      updateSearchParam("tab", nextTab);
    });
  };

  const setProgressSub = (nextSubTab: ProgressSubTab) => {
    setProgressSubState(nextSubTab);
    updateSearchParam("sub", nextSubTab);
  };

  const handleStatusChange = (newStatus: AccountStatus) => {
    if (newStatus === status) return;
    setPendingStatus(newStatus);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus || !currentUser) return;

    const fromStatus = status;
    const toStatus = pendingStatus;
    const now = new Date();
    const updatedUser: IUser = {
      ...currentUser,
      accountStatus: toStatus,
      hasAccess: toStatus !== "disabled",
    };
    const historyEntry: IStatusHistoryEntry = {
      at: now,
      kind: "system",
      fromStatus,
      toStatus,
      changedBy: (currentUserAuth as { _id?: string } | null)?._id || undefined,
    };

    if (toStatus === "frozen") {
      // Freeze snapshots remaining coaching days so unfreezing can restore exactly that time.
      const daysRemaining = getDaysRemaining(currentUser.dateFinished) ?? 0;
      updatedUser.frozenAt = now;
      updatedUser.frozenDaysRemaining = daysRemaining;
      historyEntry.frozenDaysRemaining = daysRemaining;
    } else if (fromStatus === "frozen") {
      // Unfreeze restores from today using the saved snapshot, not by extending the old date.
      const savedDays = currentUser.frozenDaysRemaining || 0;
      if (savedDays > 0) {
        updatedUser.dateFinished = new Date(now.getTime() + savedDays * 24 * 60 * 60 * 1000);
        historyEntry.daysAdded = savedDays;
      }
      updatedUser.frozenAt = undefined;
      updatedUser.frozenDaysRemaining = undefined;
    }

    updatedUser.statusHistory = [...(currentUser.statusHistory || []), historyEntry];

    try {
      await updateUser.mutateAsync({ id: currentUser._id!, user: updatedUser });
      setStatus(toStatus);
    } catch (updateError: any) {
      console.error("Status update failed:", {
        status: updateError?.status || updateError?.response?.status,
        message: updateError?.message || updateError?.data?.message,
        body: updateError?.data,
      });
    } finally {
      setPendingStatus(null);
    }
  };

  const confirmPlanTypeChange = async () => {
    if (!pendingPlanType || !currentUser) return;

    const updatedUser: IUser = {
      ...currentUser,
      planType: pendingPlanType,
    };

    try {
      await updateUser.mutateAsync({ id: currentUser._id!, user: updatedUser });
      setPlanType(pendingPlanType);
    } catch (updateError) {
      console.error(updateError);
    } finally {
      setPendingPlanType(null);
    }
  };

  const handleAddStatusNote = async (note: string) => {
    if (!currentUser) return;

    const entry: IStatusHistoryEntry = {
      at: new Date(),
      kind: "manual",
      fromStatus: status,
      toStatus: status,
      changedBy: (currentUserAuth as { _id?: string } | null)?._id || undefined,
      note: note.trim(),
    };
    const updatedUser: IUser = {
      ...currentUser,
      statusHistory: [...(currentUser.statusHistory || []), entry],
    };

    await updateUser.mutateAsync({ id: currentUser._id!, user: updatedUser });
  };

  return (
    <div data-testid="user-dashboard" dir="rtl" className="flex flex-col gap-5 font-heebo">
      <UserDashboardHeader
        user={currentUser}
        initials={initials}
        planType={planType}
        status={status}
        isPending={updateUser.isPending}
        onBack={() => navigate("/users")}
        onPlanTypeChange={(newPlanType) => {
          if (newPlanType !== planType) setPendingPlanType(newPlanType);
        }}
        onStatusChange={handleStatusChange}
      />

      <UserDashboardTabs activeTab={mainTab} onTabChange={setMainTab} />

      {mainTab === "profile" && (
        <UserDashboardProfileTab
          user={currentUser}
          status={status}
          onEdit={() => navigate(`/users/edit/${currentUser?._id}`)}
          onAddStatusNote={handleAddStatusNote}
        />
      )}

      {mainTab === "progress" && (
        <ProgressTabPanel activeSubTab={progressSub} onSubTabChange={setProgressSub} />
      )}

      {mainTab === "workout" && (
        <WorkoutTabPanel
          userId={currentUser?._id}
          swapModalOpen={swapModalOpen}
          onOpenSwapModal={() => setSwapModalOpen(true)}
          onCloseSwapModal={() => setSwapModalOpen(false)}
        />
      )}

      {mainTab === "diet" && <DietTabPanel userId={currentUser?._id} />}

      {mainTab === "forms" && <FormsTabPanel />}

      {pendingStatus && (
        <StatusConfirmationModal
          fromStatus={status}
          toStatus={pendingStatus}
          userName={userName}
          isPending={updateUser.isPending}
          daysRemaining={getDaysRemaining(currentUser?.dateFinished)}
          onConfirm={confirmStatusChange}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      {pendingPlanType && (
        <PlanTypeConfirmationModal
          fromPlanType={planType}
          toPlanType={pendingPlanType}
          userName={userName}
          isPending={updateUser.isPending}
          onConfirm={confirmPlanTypeChange}
          onCancel={() => setPendingPlanType(null)}
        />
      )}
    </div>
  );
};
