import { getUserInitials } from "./usersPageUtils";
import { buildPhotoUrl, cn } from "@/lib/utils";

interface UserAvatarProps {
  user: { firstName?: string; lastName?: string; profileImage?: string } | null;
  showImage?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className, showImage = false }) => {
  const initials = getUserInitials(user);
  const profileImage = user?.profileImage;
  const altText = `${user?.firstName} ${user?.lastName}`;

  if (profileImage && showImage) {
    return (
      <img
        src={buildPhotoUrl(profileImage)}
        alt={altText}
        className={cn("h-12 w-12 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-400 text-base font-bold text-white",
        className
      )}
    >
      {initials}
    </div>
  );
};
