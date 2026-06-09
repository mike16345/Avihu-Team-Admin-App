/**
 * Mock Data Hooks
 * =================
 * שכבת hooks המחקה את ה-hooks האמיתיים של המערכת.
 * חתימת הפונקציות זהה ל-hooks האמיתיים — זה מאפשר swap קל בעתיד.
 *
 * דוגמה לחיבור עתידי:
 *   במקום: import { useMockUserQuery } from '@/mock/hooks/useMockData'
 *   להחליף: import useUserQuery from '@/hooks/queries/user/useUserQuery'
 *
 * החתימה זהה — אין שינוי בקומפוננטים שמשתמשים ב-hook.
 */
import { IUser } from "@/interfaces/IUser";
import { IWeighIns } from "@/interfaces/IWeighIns";
import { IUserMuscleMeasurements } from "@/interfaces/measurements";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { mockUsers, getMockUser } from "../data/users";
import { mockWeighInsByUser } from "../data/weighIns";
import { mockMeasurementsByUser } from "../data/measurements";
import { mockDietPlanByUser } from "../data/dietPlans";

type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const ok = <T>(data: T): QueryResult<T> => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
});

/** רשימת כל המתאמנים — מקביל ל-useUsersQuery */
export const useMockUsersQuery = (): QueryResult<IUser[]> => ok(mockUsers);

/** מתאמן בודד — מקביל ל-useUserQuery */
export const useMockUserQuery = (userId?: string): QueryResult<IUser | undefined> =>
  ok(userId ? getMockUser(userId) : undefined);

/** שקילות של מתאמן — מקביל ל-useWeighInsApi.getUserWeighIns */
export const useMockWeighInsQuery = (userId?: string): QueryResult<IWeighIns | undefined> =>
  ok(userId ? mockWeighInsByUser[userId] : undefined);

/** מדידות היקפים — מקביל ל-useMeasurementsApi.getUserMeasurements */
export const useMockMeasurementsQuery = (
  userId?: string
): QueryResult<IUserMuscleMeasurements | undefined> =>
  ok(userId ? mockMeasurementsByUser[userId] : undefined);

/** תפריט תזונה — מקביל ל-useDietPlanApi.getUserDietPlan */
export const useMockDietPlanQuery = (userId?: string): QueryResult<IDietPlan | undefined> =>
  ok(userId ? mockDietPlanByUser[userId] : undefined);
