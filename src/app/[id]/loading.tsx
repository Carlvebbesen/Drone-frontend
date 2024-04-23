import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="w-full">
      <Skeleton className="w-96 h-40" />
      <Skeleton className="w-96 h-40" />
      <Skeleton className="w-96 h-40" />
      <Skeleton className="w-96 h-40" />
    </div>
  );
};
export default Loading;
