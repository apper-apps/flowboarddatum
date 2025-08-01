import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import KanbanBoard from "@/components/organisms/KanbanBoard";
import TaskTable from "@/components/organisms/TaskTable";
import TaskModal from "@/components/organisms/TaskModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { projectService } from "@/services/api/projectService";
import { taskService } from "@/services/api/taskService";

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("kanban");
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, tasksData] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProjectId(projectId)
      ]);
      
      if (!projectData) {
        navigate("/projects");
        toast.error("Project not found");
        return;
      }
      
      setProject(projectData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message || "Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const handleTaskClick = (task) => {
    setTaskModal({ isOpen: true, task });
  };

  const handleCreateTask = (initialData = {}) => {
    setTaskModal({ isOpen: true, task: null, initialData });
  };

  const handleTaskSave = async (taskData) => {
    try {
      let savedTask;
      if (taskData.Id) {
        savedTask = await taskService.update(taskData.Id, taskData);
        setTasks(prev => prev.map(t => t.Id === savedTask.Id ? savedTask : t));
      } else {
        savedTask = await taskService.create({ ...taskData, projectId });
        setTasks(prev => [...prev, savedTask]);
      }
      setTaskModal({ isOpen: false, task: null });
    } catch (error) {
      throw error;
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.Id !== taskId));
      setTaskModal({ isOpen: false, task: null });
    } catch (error) {
      throw error;
    }
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      const savedTask = await taskService.update(updatedTask.Id, updatedTask);
      setTasks(prev => prev.map(t => t.Id === savedTask.Id ? savedTask : t));
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
      console.error("Error updating task:", error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "success";
      case "completed": return "info";
      case "on hold": return "warning";
      case "planning": return "default";
      default: return "default";
    }
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length
  };

  if (loading) {
    return <Loading variant={view === "kanban" ? "kanban" : "table"} />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load project"
        message={error}
        onRetry={loadData}
      />
    );
  }

  if (!project) {
    return (
      <Error
        title="Project not found"
        message="The project you're looking for doesn't exist or has been removed."
        onRetry={() => navigate("/projects")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate("/projects")}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="ArrowLeft" size={20} />
              </button>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                {project.name}
              </h1>
              <Badge variant={getStatusVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Project Progress</span>
                <span className="font-medium gradient-text">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  view === "kanban" 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="Kanban" size={16} className="mr-2" />
                Board
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  view === "list" 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="List" size={16} className="mr-2" />
                List
              </button>
            </div>
            
            <Button onClick={() => handleCreateTask()}>
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100 text-center">
          <p className="text-2xl font-bold gradient-text">{taskStats.total}</p>
          <p className="text-sm text-gray-600">Total Tasks</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-600">{taskStats.todo}</p>
          <p className="text-sm text-gray-600">To Do</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100 text-center">
          <p className="text-2xl font-bold text-warning">{taskStats.inProgress}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100 text-center">
          <p className="text-2xl font-bold text-info">{taskStats.review}</p>
          <p className="text-sm text-gray-600">Review</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100 text-center">
          <p className="text-2xl font-bold text-success">{taskStats.done}</p>
          <p className="text-sm text-gray-600">Done</p>
        </div>
      </div>

      {/* Task Views */}
      {view === "kanban" ? (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          onCreateTask={handleCreateTask}
        />
      ) : (
        <TaskTable
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        task={taskModal.task}
        isOpen={taskModal.isOpen}
        onClose={() => setTaskModal({ isOpen: false, task: null })}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectBoard;