import React from "react";
import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "card" }) => {
  const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  if (variant === "table") {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <div className={cn("h-4 w-4 bg-gray-200 rounded", shimmer)} />
            <div className={cn("h-4 flex-1 bg-gray-200 rounded", shimmer)} />
            <div className={cn("h-4 w-24 bg-gray-200 rounded", shimmer)} />
            <div className={cn("h-4 w-20 bg-gray-200 rounded", shimmer)} />
            <div className={cn("h-4 w-16 bg-gray-200 rounded", shimmer)} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-card space-y-4">
            <div className={cn("h-6 w-3/4 bg-gray-200 rounded", shimmer)} />
            <div className={cn("h-4 w-full bg-gray-200 rounded", shimmer)} />
            <div className={cn("h-4 w-2/3 bg-gray-200 rounded", shimmer)} />
            <div className="flex justify-between items-center">
              <div className={cn("h-6 w-16 bg-gray-200 rounded-full", shimmer)} />
              <div className={cn("h-4 w-20 bg-gray-200 rounded", shimmer)} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "kanban") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-6", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className={cn("h-6 w-24 bg-gray-200 rounded", shimmer)} />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
                  <div className={cn("h-4 w-full bg-gray-200 rounded", shimmer)} />
                  <div className={cn("h-3 w-2/3 bg-gray-200 rounded", shimmer)} />
                  <div className="flex justify-between items-center">
                    <div className={cn("h-6 w-6 bg-gray-200 rounded-full", shimmer)} />
                    <div className={cn("h-4 w-16 bg-gray-200 rounded", shimmer)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className={cn("bg-white rounded-lg p-6 shadow-card space-y-4", className)}>
      <div className={cn("h-6 w-3/4 bg-gray-200 rounded", shimmer)} />
      <div className={cn("h-4 w-full bg-gray-200 rounded", shimmer)} />
      <div className={cn("h-4 w-2/3 bg-gray-200 rounded", shimmer)} />
      <div className="flex justify-between items-center">
        <div className={cn("h-6 w-16 bg-gray-200 rounded-full", shimmer)} />
        <div className={cn("h-4 w-20 bg-gray-200 rounded", shimmer)} />
      </div>
    </div>
  );
};

// Add shimmer keyframe to global styles via CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

export default Loading;