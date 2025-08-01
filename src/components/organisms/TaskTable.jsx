import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

const TaskTable = ({ tasks, onTaskClick, onCreateTask }) => {
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === "dueDate" || sortField === "createdAt") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case "todo": return "default";
      case "in-progress": return "warning";
      case "review": return "info";
      case "done": return "success";
      default: return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo": return "To Do";
      case "in-progress": return "In Progress";
      case "review": return "Review";
      case "done": return "Done";
      default: return status;
    }
  };

  const SortHeader = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <ApperIcon 
            name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} 
            size={14} 
          />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-gray-900">
          All Tasks ({tasks.length})
        </h3>
        <Button onClick={() => onCreateTask()}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Task
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="title">Task</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="priority">Priority</SortHeader>
              <SortHeader field="assignee">Assignee</SortHeader>
              <SortHeader field="dueDate">Due Date</SortHeader>
              <SortHeader field="createdAt">Created</SortHeader>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <tr
                key={task.Id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onTaskClick(task)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.priority && (
                    <Badge variant={task.priority}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Avatar name={task.assignee} size="sm" />
                    <span className="text-sm text-gray-900">{task.assignee}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(task.createdAt), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                  >
                    <ApperIcon name="Edit" size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="CheckSquare" size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first task.</p>
          <Button onClick={() => onCreateTask()}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Create First Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskTable;