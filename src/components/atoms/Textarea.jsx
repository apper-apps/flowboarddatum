import React from "react";
import { cn } from "@/utils/cn";

const Textarea = React.forwardRef(({ 
  className, 
  error,
  ...props 
}, ref) => {
  const baseStyles = "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-vertical";
  
  const errorStyles = error 
    ? "border-error focus:ring-error" 
    : "border-gray-300 hover:border-gray-400";
  
  return (
    <textarea
      className={cn(baseStyles, errorStyles, className)}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;