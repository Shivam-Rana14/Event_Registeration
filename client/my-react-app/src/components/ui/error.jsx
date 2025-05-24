import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const Error = ({ message, className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive",
        className
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default Error;
