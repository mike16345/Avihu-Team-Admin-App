interface DietPlanVersionUser {
  _id?: string;
  dietPlanVersion?: 1 | 2;
}

const DIET_V2_PREVIEW_TRAINER_IDS = new Set(["6774eb1c730c4c44354db2d0"]);

export const usesDietPlanV2 = (user?: DietPlanVersionUser | null): boolean => {
  if (!user) return false;
  if (user.dietPlanVersion) return user.dietPlanVersion === 2;

  return !!user._id && DIET_V2_PREVIEW_TRAINER_IDS.has(user._id);
};
