import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-n-6", className)}
      {...props}
    />
  );
}

export { Skeleton };
