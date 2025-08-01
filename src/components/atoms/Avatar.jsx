import React from "react";
import { cn } from "@/utils/cn";

const Avatar = React.forwardRef(({ 
  className, 
  size = "md",
  src,
  alt,
  name,
  ...props 
}, ref) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white font-medium overflow-hidden";
  
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div
      className={cn(baseStyles, sizes[size], className)}
      ref={ref}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;