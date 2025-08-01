import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import PrioritySelect from "@/components/molecules/PrioritySelect";
import StatusSelect from "@/components/molecules/StatusSelect";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

const TaskModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  projectId 
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
    dueDate: ""
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assignee: task.assignee || "",
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: "",
        dueDate: ""
      });
    }
  }, [task]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        projectId: projectId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        updatedAt: new Date().toISOString()
      };

      if (task) {
        taskData.Id = task.Id;
        taskData.createdAt = task.createdAt;
      } else {
        taskData.createdAt = new Date().toISOString();
      }

      await onSave(taskData);
      toast.success(task ? "Task updated successfully" : "Task created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save task");
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm("Are you sure you want to delete this task?")) {
      setLoading(true);
      try {
        await onDelete(task.Id);
        toast.success("Task deleted successfully");
        onClose();
      } catch (error) {
        toast.error("Failed to delete task");
        console.error("Error deleting task:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-display font-semibold text-gray-900">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField
            label="Task Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter task title..."
            required
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Add task description..."
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <StatusSelect
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <PrioritySelect
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Assignee"
              value={formData.assignee}
              onChange={(e) => handleInputChange("assignee", e.target.value)}
              placeholder="Assign to..."
            />

            <FormField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              {task && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <ApperIcon name="Trash2" size={16} className="mr-2" />
                  Delete Task
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    {task ? "Update Task" : "Create Task"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;