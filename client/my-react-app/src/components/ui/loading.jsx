import React from "react";
import { cn } from "../../lib/utils";

const Loading = ({ className, size = "default" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-n-6 border-t-primary",
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export default Loading;
