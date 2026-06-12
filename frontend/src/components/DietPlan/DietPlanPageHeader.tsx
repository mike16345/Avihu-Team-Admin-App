import BackLink from "../ui/BackLink";
import BasicUserDetails from "../UserDashboard/UserInfo/BasicUserDetails";
import FormResponseBubbleWrapper from "../formResponses/FormResponseBubbleWrapper";
import type { IUser } from "@/interfaces/IUser";

interface DietPlanPageHeaderProps {
  backLink: string;
  user?: IUser;
  userId?: string;
}

export function DietPlanPageHeader({ backLink, user, userId }: DietPlanPageHeaderProps) {
  return (
    <>
      {user && <BasicUserDetails user={user} />}
      <FormResponseBubbleWrapper userId={userId} />
      <BackLink to={backLink} label="חזרה לפרופיל המתאמן" />
    </>
  );
}
