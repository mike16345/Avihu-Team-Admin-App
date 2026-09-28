import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type SafeAuthUser } from "@/interfaces/IAuth";
import { type Trainer } from "@/interfaces/trainers";
import { useUpdateTrainer } from "@/hooks/mutations/trainers/useUpdateTrainer";
import { useTrainerQuery } from "@/hooks/queries/trainers/useTrainerQuery";
import { QueryKeys } from "@/enums/QueryKeys";
import { normalizeAppRole } from "@/routes/routeAccess";
import { setAuthSession } from "@/services/authSession";
import { useUsersStore } from "@/store/userStore";

type FavoriteField = "favoriteWorkoutPresetIds" | "favoriteDietPresetIds";

type UseFavoritePresetIdsOptions = {
  field: FavoriteField;
  queryKey: QueryKeys.WORKOUT_PRESETS | QueryKeys.DIET_PLAN_PRESETS;
  errorMessage: string;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

const getFavoriteIdsFromUser = (user: SafeAuthUser | null, field: FavoriteField): string[] => {
  const value = user?.[field];
  return isStringArray(value) ? value : [];
};

const getFavoriteIdsFromTrainer = (
  trainer: Trainer | undefined,
  field: FavoriteField
): string[] => {
  const value = trainer?.[field];
  return isStringArray(value) ? value : [];
};

const areIdsEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const toggleId = (ids: string[], id: string) => {
  if (ids.includes(id)) {
    return ids.filter((entry) => entry !== id);
  }

  return [...ids, id];
};

const updateUserFavorites = (
  currentUser: SafeAuthUser | null,
  field: FavoriteField,
  ids: string[],
  setCurrentUser: (user: SafeAuthUser | null) => void
) => {
  if (!currentUser) return;

  const nextUser: SafeAuthUser = {
    ...currentUser,
    [field]: ids,
  };

  setCurrentUser(nextUser);
  setAuthSession({ nextUser: nextUser });
};

export const useFavoritePresetIds = ({
  field,
  queryKey,
  errorMessage,
}: UseFavoritePresetIdsOptions) => {
  const queryClient = useQueryClient();
  const currentUser = useUsersStore((state) => state.currentUser);
  const setCurrentUser = useUsersStore((state) => state.setCurrentUser);
  const updateTrainerMutation = useUpdateTrainer();

  const trainerId = currentUser?.trainerId;

  const { data: trainerData } = useTrainerQuery(trainerId);
  const trainer = trainerData?.trainer;
  const canToggle = Boolean(currentUser && trainerId && trainer);

  const ids = useMemo(() => {
    const userIds = getFavoriteIdsFromUser(currentUser, field);
    if (userIds.length > 0) return userIds;

    return getFavoriteIdsFromTrainer(trainer, field);
  }, [currentUser, field, trainer]);

  useEffect(() => {
    if (!currentUser || !trainer) return;

    const trainerIds = getFavoriteIdsFromTrainer(trainer, field);
    const userIds = getFavoriteIdsFromUser(currentUser, field);
    if (areIdsEqual(userIds, trainerIds)) return;

    updateUserFavorites(currentUser, field, trainerIds, setCurrentUser);
  }, [currentUser, field, setCurrentUser, trainer]);

  const isFavorite = useCallback(
    (id?: string) => {
      if (!id) return false;
      return ids.includes(id);
    },
    [ids]
  );

  const toggle = useCallback(
    async (id?: string) => {
      if (!id || !currentUser || !trainerId || !trainer) return;

      const previousIds = ids;
      const nextIds = toggleId(previousIds, id);

      updateUserFavorites(currentUser, field, nextIds, setCurrentUser);

      try {
        const updatedTrainer = await updateTrainerMutation.mutateAsync({
          id: trainerId,
          body: {
            fullName: trainer.fullName,
            email: trainer.email,
            phone: trainer.phone,
            subscriptionPlan: trainer.subscriptionPlan,
            clientLimit: trainer.clientLimit,
            subTrainerLimit: trainer.subTrainerLimit,
            status: trainer.status,
            source: trainer.source,
            videoLibraryAccess: trainer.videoLibraryAccess,
            userId: trainer.userId,
            isDeleted: trainer.isDeleted,
            favoriteWorkoutPresetIds:
              field === "favoriteWorkoutPresetIds"
                ? nextIds
                : (trainer.favoriteWorkoutPresetIds ?? []),
            favoriteDietPresetIds:
              field === "favoriteDietPresetIds" ? nextIds : (trainer.favoriteDietPresetIds ?? []),
            sharesFavorites: trainer.sharesFavorites,
          },
        });

        updateUserFavorites(
          currentUser,
          field,
          getFavoriteIdsFromTrainer(updatedTrainer, field),
          setCurrentUser
        );
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      } catch (error: any) {
        updateUserFavorites(currentUser, field, previousIds, setCurrentUser);
        toast.error(errorMessage, {
          description: error?.data?.message ?? error?.message,
        });
      }
    },
    [
      currentUser,
      field,
      ids,
      queryClient,
      queryKey,
      setCurrentUser,
      trainer,
      trainerId,
      updateTrainerMutation,
      errorMessage,
    ]
  );

  return {
    isFavorite,
    toggle,
    count: ids.length,
    ids,
    canToggle,
    isPending: updateTrainerMutation.isPending,
  };
};
