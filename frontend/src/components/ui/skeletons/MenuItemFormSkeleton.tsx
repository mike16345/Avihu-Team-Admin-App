import { Skeleton } from "../skeleton";

const MenuItemFormSkeleton = () => {
  return (
    <div className="space-y-4 text-right">
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex gap-5">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
};

export default MenuItemFormSkeleton;
