import { Skeleton } from "../skeleton";

const TemplateTabsSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-8 w-32 mt-5" />
      <Skeleton className="h-8 w-72 mt-8" />
      <Skeleton className="h-10 w-full mt-7" />
      <Skeleton className="h-10 w-full mt-4" />
      <Skeleton className="h-10 w-full mt-4" />
      <Skeleton className="h-10 w-full mt-4" />
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
};

export default TemplateTabsSkeleton;
