# Mock Data Layer — שכבת ביניים לעיצוב

תיקייה זו מספקת שכבת נתונים מקבילה לזו שמתחברת ל-API האמיתי.

## למה?

לאפשר פיתוח עיצוב מלא ובדיקות UI **בלי חיבור לשרת**.
כשנהיה מוכנים לחיבור — **לא נדרש שכתוב של הקומפוננטים**, רק החלפת imports.

## מבנה

```
src/mock/
  data/              ← נתוני דמה (טיפוסים זהים ל-API האמיתי)
    users.ts         ← IUser[]
    weighIns.ts      ← IWeighIns לפי userId
    measurements.ts  ← IUserMuscleMeasurements לפי userId
    dietPlans.ts     ← IDietPlan לפי userId
  hooks/
    useMockData.ts   ← Hooks עם חתימה זהה ל-hooks האמיתיים
```

## איך להחליף ל-API אמיתי

| Mock Hook | API Hook אמיתי | קובץ |
|---|---|---|
| `useMockUserQuery` | `useUserQuery` | `hooks/queries/user/useUserQuery.tsx` |
| `useMockUsersQuery` | `useUsersQuery` | `hooks/queries/user/useUsersQuery.tsx` |
| `useMockWeighInsQuery` | `useUserWeighInsQuery` | `hooks/queries/weighIn/...` |
| `useMockMeasurementsQuery` | `useMeasurementQuery` | `hooks/queries/measurement/...` |
| `useMockDietPlanQuery` | `useUserDietPlanQuery` | `hooks/queries/dietPlan/...` |

החתימה זהה: `(userId?: string) => { data, isLoading, isError, error }`.

**דוגמת החלפה:**
```ts
// היום (Mock):
import { useMockUserQuery } from '@/mock/hooks/useMockData';
const { data: user } = useMockUserQuery(id);

// אחר כך (API אמיתי):
import useUserQuery from '@/hooks/queries/user/useUserQuery';
const { data: user } = useUserQuery(id);
```

זהו. בלי שינוי בלוגיקה של הקומפוננט.
