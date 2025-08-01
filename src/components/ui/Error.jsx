import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Error = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading your data. Please try again.",
  onRetry,
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white rounded-lg shadow-card border border-gray-100",
      className
    )}>
      <div className="w-16 h-16 bg-gradient-to-br from-error/10 to-error/20 rounded-full flex items-center justify-center">
        <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-display font-semibold text-lg text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {message}
        </p>
      </div>
      
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;