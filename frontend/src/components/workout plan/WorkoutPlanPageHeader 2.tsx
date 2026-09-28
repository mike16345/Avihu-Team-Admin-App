import BackButton from "../ui/BackButton";
import BasicUserDetails from "../UserDashboard/UserInfo/BasicUserDetails";
import FormResponseBubbleWrapper from "../formResponses/FormResponseBubbleWrapper";
import type { IUser } from "@/interfaces/IUser";

interface WorkoutPlanPageHeaderProps {
  backLink: string;
  user?: IUser;
  userId: string;
}

export function WorkoutPlanPageHeader({ backLink, user, userId }: WorkoutPlanPageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">תוכנית אימון</h1>
      <BackButton navLink={backLink} />

      {user && <BasicUserDetails user={user} />}
      <FormResponseBubbleWrapper userId={userId} />
    </div>
  );
}
