import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { projectService } from "@/services/api/projectService";
import { taskService } from "@/services/api/taskService";
import { userService } from "@/services/api/userService";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll(),
        userService.getAll()
      ]);
      
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredTasks = () => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    switch (selectedPeriod) {
      case "current":
        return tasks.filter(task => 
          isWithinInterval(new Date(task.createdAt), { start: currentMonthStart, end: currentMonthEnd })
        );
      case "last":
        return tasks.filter(task => 
          isWithinInterval(new Date(task.createdAt), { start: lastMonthStart, end: lastMonthEnd })
        );
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  // Project Statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === "Active").length,
    completed: projects.filter(p => p.status === "Completed").length,
    onHold: projects.filter(p => p.status === "On Hold").length,
    planning: projects.filter(p => p.status === "Planning").length,
    averageProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  };

  // Task Statistics
  const taskStats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === "done").length,
    inProgress: filteredTasks.filter(t => t.status === "in-progress").length,
    todo: filteredTasks.filter(t => t.status === "todo").length,
    review: filteredTasks.filter(t => t.status === "review").length,
    completionRate: filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === "done").length / filteredTasks.length) * 100) : 0
  };

  // Priority Distribution
  const priorityStats = {
    high: filteredTasks.filter(t => t.priority === "high").length,
    medium: filteredTasks.filter(t => t.priority === "medium").length,
    low: filteredTasks.filter(t => t.priority === "low").length
  };

  // Team Performance
  const teamPerformance = users.map(user => {
    const userTasks = filteredTasks.filter(t => t.assignee === user.name);
    const completedTasks = userTasks.filter(t => t.status === "done").length;
    
    return {
      ...user,
      totalTasks: userTasks.length,
      completedTasks,
      completionRate: userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  // Top Projects by Progress
  const topProjects = [...projects]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load reports"
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
            Project Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Analyze project performance and team productivity
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="current">This Month</option>
            <option value="last">Last Month</option>
          </select>
          
          <Button>
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold gradient-text mt-2">{projectStats.total}</p>
              <p className="text-sm text-gray-500 mt-1">{projectStats.averageProgress}% avg progress</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="FolderOpen" className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-info mt-2">{taskStats.total}</p>
              <p className="text-sm text-gray-500 mt-1">{taskStats.completionRate}% completion rate</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-info/10 to-info/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="text-info" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-3xl font-bold text-success mt-2">{taskStats.completed}</p>
              <p className="text-sm text-gray-500 mt-1">of {taskStats.total} total</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="text-success" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-warning mt-2">{users.length}</p>
              <p className="text-sm text-gray-500 mt-1">active contributors</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="text-warning" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Project Status Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{projectStats.active}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectStats.total > 0 ? (projectStats.active / projectStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{projectStats.completed}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-info h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectStats.total > 0 ? (projectStats.completed / projectStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-sm text-gray-600">On Hold</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{projectStats.onHold}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectStats.total > 0 ? (projectStats.onHold / projectStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{projectStats.planning}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectStats.total > 0 ? (projectStats.planning / projectStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Task Priority Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Task Priority Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error rounded-full"></div>
                <span className="text-sm text-gray-600">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{priorityStats.high}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-error h-2 rounded-full transition-all duration-300"
                    style={{ width: `${taskStats.total > 0 ? (priorityStats.high / taskStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-sm text-gray-600">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{priorityStats.medium}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: `${taskStats.total > 0 ? (priorityStats.medium / taskStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-gray-600">Low Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{priorityStats.low}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${taskStats.total > 0 ? (priorityStats.low / taskStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Status Overview */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Task Status</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-success">{taskStats.completed}</p>
                <p className="text-xs text-gray-600">Done</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-warning">{taskStats.inProgress}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Projects */}
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Top Performing Projects
          </h3>
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div key={project.Id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                  <p className="text-xs text-gray-500">Progress: {project.progress}%</p>
                </div>
                <Badge variant={project.status === "Active" ? "success" : project.status === "Completed" ? "info" : "warning"}>
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
            Team Performance
          </h3>
          <div className="space-y-4">
            {teamPerformance.slice(0, 5).map((member, index) => (
              <div key={member.Id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.completedTasks}/{member.totalTasks} tasks completed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{member.completionRate}%</p>
                  <p className="text-xs text-gray-500">completion</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;