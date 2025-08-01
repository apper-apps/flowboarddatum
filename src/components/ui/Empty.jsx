import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  icon = "Inbox",
  title = "No items found",
  message = "Get started by creating your first item.",
  actionLabel = "Create New",
  onAction,
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white rounded-lg shadow-card border border-gray-100",
      className
    )}>
      <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-full flex items-center justify-center">
        <ApperIcon name={icon} className="w-10 h-10 text-primary" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-display font-semibold text-xl text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {message}
        </p>
      </div>
      
      {onAction && actionLabel && (
        <Button onClick={onAction} size="lg" className="mt-6">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;