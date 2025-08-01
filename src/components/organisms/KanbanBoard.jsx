import React, { useState } from "react";
import TaskCard from "@/components/molecules/TaskCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const KanbanBoard = ({ tasks, onTaskClick, onTaskUpdate, onCreateTask }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: "todo", title: "To Do", color: "bg-gray-100", tasks: tasks.filter(t => t.status === "todo") },
    { id: "in-progress", title: "In Progress", color: "bg-warning/10", tasks: tasks.filter(t => t.status === "in-progress") },
    { id: "review", title: "Review", color: "bg-info/10", tasks: tasks.filter(t => t.status === "review") },
    { id: "done", title: "Done", color: "bg-success/10", tasks: tasks.filter(t => t.status === "done") }
  ];

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === columnId) return;

    try {
      const updatedTask = {
        ...draggedTask,
        status: columnId,
        updatedAt: new Date().toISOString()
      };
      
      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleCreateTask = (status) => {
    onCreateTask({ status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            "rounded-xl p-4 min-h-[600px] transition-all duration-200",
            column.color,
            draggedTask && "border-2 border-dashed border-primary/30"
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-gray-900">
                {column.title}
              </h3>
              <span className="bg-white/80 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                {column.tasks.length}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCreateTask(column.id)}
              className="h-8 w-8 p-0"
            >
              <ApperIcon name="Plus" size={16} />
            </Button>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                onClick={() => onTaskClick(task)}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={draggedTask?.Id === task.Id ? "opacity-50 rotate-2" : ""}
              />
            ))}
            
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Plus" size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateTask(column.id)}
                  className="mt-2 text-xs"
                >
                  Add first task
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;