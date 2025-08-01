import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import TaskCard from "@/components/molecules/TaskCard";
import TaskModal from "@/components/organisms/TaskModal";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import { format, isToday, isTomorrow, isPast } from "date-fns";

const MyTasks = () => {
  const { searchValue } = useOutletContext() || {};
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null });

  const currentUser = "John Doe"; // This would come from user context in a real app

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allTasks, allProjects] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(task => 
        task.assignee?.toLowerCase().includes(currentUser.toLowerCase()) ||
        task.assignee === currentUser
      );
      
      setTasks(myTasks);
      setProjects(allProjects);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskClick = (task) => {
    setTaskModal({ isOpen: true, task });
  };

  const handleTaskSave = async (taskData) => {
    try {
      let savedTask;
      if (taskData.Id) {
        savedTask = await taskService.update(taskData.Id, taskData);
        setTasks(prev => prev.map(t => t.Id === savedTask.Id ? savedTask : t));
      } else {
        savedTask = await taskService.create(taskData);
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

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id.toString() === projectId);
    return project?.name || "Unknown Project";
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return "overdue";
    if (isToday(date)) return "today";
    if (isTomorrow(date)) return "tomorrow";
    return "upcoming";
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchValue || 
      task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      getProjectName(task.projectId).toLowerCase().includes(searchValue.toLowerCase());

    switch (filter) {
      case "overdue":
        return matchesSearch && task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
      case "today":
        return matchesSearch && task.dueDate && isToday(new Date(task.dueDate));
      case "upcoming":
        return matchesSearch && task.dueDate && !isPast(new Date(task.dueDate));
      case "completed":
        return matchesSearch && task.status === "done";
      case "in-progress":
        return matchesSearch && task.status === "in-progress";
      default:
        return matchesSearch;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case "status":
        return a.status.localeCompare(b.status);
      case "project":
        return getProjectName(a.projectId).localeCompare(getProjectName(b.projectId));
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const taskStats = {
    total: tasks.length,
    overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length,
    today: tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length,
    completed: tasks.filter(t => t.status === "done").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length
  };

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load tasks"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            My Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all your assigned tasks
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Avatar name={currentUser} />
          <div>
            <p className="text-sm font-medium text-gray-900">{currentUser}</p>
            <p className="text-xs text-gray-500">{taskStats.total} total tasks</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold gradient-text mt-1">{taskStats.total}</p>
            </div>
            <ApperIcon name="CheckSquare" className="text-primary" size={20} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-error mt-1">{taskStats.overdue}</p>
            </div>
            <ApperIcon name="AlertTriangle" className="text-error" size={20} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-warning mt-1">{taskStats.today}</p>
            </div>
            <ApperIcon name="Clock" className="text-warning" size={20} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-info mt-1">{taskStats.inProgress}</p>
            </div>
            <ApperIcon name="Play" className="text-info" size={20} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-success mt-1">{taskStats.completed}</p>
            </div>
            <ApperIcon name="CheckCircle" className="text-success" size={20} />
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg p-4 shadow-card border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {[
              { key: "all", label: "All Tasks" },
              { key: "overdue", label: "Overdue" },
              { key: "today", label: "Due Today" },
              { key: "upcoming", label: "Upcoming" },
              { key: "in-progress", label: "In Progress" },
              { key: "completed", label: "Completed" }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.key
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="project">Project</option>
              <option value="created">Created Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {sortedTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          message={
            searchValue 
              ? `No tasks match "${searchValue}". Try adjusting your search or filters.`
              : filter !== "all"
              ? `No tasks match the selected filter. Try changing the filter.`
              : "You don't have any assigned tasks yet. Tasks will appear here when they're assigned to you."
          }
          actionLabel={null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTasks.map((task, index) => (
            <div
              key={task.Id}
              className="space-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Project Label */}
              <div className="flex items-center gap-2">
                <ApperIcon name="FolderOpen" size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">
                  {getProjectName(task.projectId)}
                </span>
              </div>
              
              {/* Task Card */}
              <TaskCard
                task={task}
                onClick={() => handleTaskClick(task)}
                className={
                  getDueDateStatus(task.dueDate) === "overdue" 
                    ? "border-l-4 border-l-error" 
                    : getDueDateStatus(task.dueDate) === "today"
                    ? "border-l-4 border-l-warning"
                    : ""
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        task={taskModal.task}
        isOpen={taskModal.isOpen}
        onClose={() => setTaskModal({ isOpen: false, task: null })}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        projectId={taskModal.task?.projectId}
      />
    </div>
  );
};

export default MyTasks;