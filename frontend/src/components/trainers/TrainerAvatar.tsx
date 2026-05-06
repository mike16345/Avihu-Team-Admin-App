import { cn } from "@/lib/utils";

type TrainerAvatarProps = {
  fullName: string;
  className?: string;
};

const getInitials = (fullName: string) => {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export const TrainerAvatar = ({ fullName, className }: TrainerAvatarProps) => {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C7D2FE] text-xs font-semibold text-[#3751A3]",
        className
      )}
    >
      {getInitials(fullName)}
    </div>
  );
};
