import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { userService } from "@/services/api/userService";
import { taskService } from "@/services/api/taskService";

const Team = () => {
  const { searchValue } = useOutletContext() || {};
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, tasksData] = await Promise.all([
        userService.getAll(),
        taskService.getAll()
      ]);
      
      setUsers(usersData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserTaskStats = (userName) => {
    const userTasks = tasks.filter(task => 
      task.assignee?.toLowerCase() === userName.toLowerCase()
    );
    
    return {
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === "done").length,
      inProgress: userTasks.filter(t => t.status === "in-progress").length,
      pending: userTasks.filter(t => t.status === "todo").length
    };
  };

  const getWorkloadLevel = (taskCount) => {
    if (taskCount >= 8) return { level: "high", variant: "error", label: "High" };
    if (taskCount >= 4) return { level: "medium", variant: "warning", label: "Medium" };
    if (taskCount >= 1) return { level: "low", variant: "success", label: "Low" };
    return { level: "none", variant: "default", label: "Available" };
  };

  const filteredUsers = users.filter(user => {
    if (!searchValue) return true;
    return (
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.role.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const teamStats = {
    totalMembers: users.length,
    activeTasks: tasks.filter(t => t.status !== "done").length,
    completedTasks: tasks.filter(t => t.status === "done").length,
    averageTasksPerMember: users.length > 0 ? Math.round(tasks.length / users.length) : 0
  };

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load team data"
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
            Team Members
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team and track workload distribution
          </p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold gradient-text mt-2">{teamStats.totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="text-primary" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-warning mt-2">{teamStats.activeTasks}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Activity" className="text-warning" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-success mt-2">{teamStats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="text-success" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Tasks/Member</p>
              <p className="text-3xl font-bold text-info mt-2">{teamStats.averageTasksPerMember}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-info/10 to-info/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="text-info" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Team Grid */}
      {filteredUsers.length === 0 ? (
        <Empty
          icon="Users"
          title="No team members found"
          message={
            searchValue 
              ? `No team members match "${searchValue}". Try adjusting your search.`
              : "No team members available."
          }
          actionLabel={null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => {
            const taskStats = getUserTaskStats(user.name);
            const workload = getWorkloadLevel(taskStats.total);
            
            return (
              <Card
                key={user.Id}
                hover
                className="p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-start gap-4">
                    <Avatar name={user.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <Badge variant="primary" className="mt-1">
                        {user.role}
                      </Badge>
                    </div>
                    <Badge variant={workload.variant}>
                      {workload.label}
                    </Badge>
                  </div>

                  {/* Task Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold gradient-text">{taskStats.total}</p>
                      <p className="text-xs text-gray-600">Total Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{taskStats.completed}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>

                  {/* Progress Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Task Progress</span>
                      <span className="font-medium">
                        {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>
                          <span className="inline-block w-2 h-2 bg-warning rounded-full mr-1"></span>
                          In Progress: {taskStats.inProgress}
                        </span>
                        <span>
                          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                          Pending: {taskStats.pending}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
                      <ApperIcon name="Mail" size={14} className="mr-1" />
                      Email
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <ApperIcon name="MessageCircle" size={14} className="mr-1" />
                      Message
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;