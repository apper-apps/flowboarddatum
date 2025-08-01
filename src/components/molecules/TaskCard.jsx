import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { cn } from "@/utils/cn";

const TaskCard = ({ 
  task, 
  onClick, 
  draggable = false, 
  onDragStart, 
  onDragEnd,
  className,
  variant = "default", // "default", "timeline"
  timelineData = null
}) => {
  const getDueDateStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const tomorrow = addDays(today, 1);
    
    if (isBefore(due, today)) return { variant: "error", text: "Overdue", icon: "AlertTriangle" };
    if (isBefore(due, tomorrow)) return { variant: "warning", text: "Due Today", icon: "Clock" };
    return { variant: "default", text: format(due, "MMM dd"), icon: "Calendar" };
  };

  const dueDateInfo = task.dueDate ? getDueDateStatus(task.dueDate) : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", task.Id.toString());
    if (onDragStart) onDragStart(e, task);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd(e, task);
  };

// Timeline variant for Gantt chart display
  if (variant === "timeline") {
    return (
      <div
        className={cn(
          "relative h-12 cursor-pointer group rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200",
          draggable && "transition-transform duration-200 active:scale-105",
          className
        )}
        onClick={onClick}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={timelineData?.style}
      >
        <div className="flex items-center h-full px-3 space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full flex-shrink-0",
            task.priority === "high" ? "bg-error" :
            task.priority === "medium" ? "bg-warning" : "bg-gray-400"
          )} />
          <span className="text-sm font-medium text-gray-900 truncate flex-1">
            {task.title}
          </span>
          <Avatar name={task.assignee} size="xs" />
        </div>
        
        {/* Dependencies lines would be rendered by parent TimelineView */}
        {timelineData?.showDuration && (
          <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
            {timelineData.duration}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card
      hover
      className={cn(
        "p-4 cursor-pointer group animate-fade-in-up",
        draggable && "transition-transform duration-200 active:scale-105",
        className
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Priority Badge */}
        {task.priority && (
          <div className="flex items-center gap-2">
            <Badge variant={task.priority}>
              <ApperIcon 
                name={task.priority === "high" ? "AlertCircle" : task.priority === "medium" ? "Circle" : "Minus"} 
                size={12} 
                className="mr-1" 
              />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <Avatar name={task.assignee} size="sm" />
            <span className="text-xs text-gray-600 truncate max-w-[80px]">
              {task.assignee}
            </span>
          </div>

          {/* Due Date */}
          {dueDateInfo && (
            <div className="flex items-center gap-1 text-xs">
              <ApperIcon name={dueDateInfo.icon} size={12} className={cn(
                dueDateInfo.variant === "error" && "text-error",
                dueDateInfo.variant === "warning" && "text-warning",
                dueDateInfo.variant === "default" && "text-gray-500"
              )} />
              <span className={cn(
                dueDateInfo.variant === "error" && "text-error font-medium",
                dueDateInfo.variant === "warning" && "text-warning font-medium",
                dueDateInfo.variant === "default" && "text-gray-500"
              )}>
                {dueDateInfo.text}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;