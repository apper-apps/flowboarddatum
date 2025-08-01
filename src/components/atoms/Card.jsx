import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  hover = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "rounded-lg bg-white shadow-card border border-gray-100 overflow-hidden";
  
  const hoverStyles = hover 
    ? "card-hover-lift cursor-pointer hover:shadow-card-hover" 
    : "";
  
  return (
    <div
      className={cn(baseStyles, hoverStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;