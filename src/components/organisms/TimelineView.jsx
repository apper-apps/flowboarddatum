import React, { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, isValid, isPast, addMonths, subMonths } from "date-fns";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { projectService } from "@/services/api/projectService";

const CalendarWidget = ({ tasks, onTaskClick, onTaskUpdate, onCreateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await projectService.getAll();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Process tasks for calendar display
  const tasksByDate = useMemo(() => {
    const taskMap = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = parseISO(task.dueDate);
        if (isValid(dueDate)) {
          const dateKey = format(dueDate, 'yyyy-MM-dd');
          if (!taskMap[dateKey]) {
            taskMap[dateKey] = [];
          }
          taskMap[dateKey].push({
            ...task,
            type: 'task',
            isOverdue: isPast(dueDate) && task.status !== 'completed'
          });
        }
      }
    });

    return taskMap;
  }, [tasks]);

  // Process projects for calendar display
  const projectsByDate = useMemo(() => {
    const projectMap = {};
    
    projects.forEach(project => {
      if (project.dueDate) {
        const dueDate = parseISO(project.dueDate);
        if (isValid(dueDate)) {
          const dateKey = format(dueDate, 'yyyy-MM-dd');
          if (!projectMap[dateKey]) {
            projectMap[dateKey] = [];
          }
          projectMap[dateKey].push({
            ...project,
            type: 'project',
            isOverdue: isPast(dueDate) && project.status !== 'completed'
          });
        }
      }
    });

    return projectMap;
  }, [projects]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-error text-white';
      case 'medium':
        return 'bg-warning text-white';
      case 'low':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success text-white';
      case 'in-progress':
        return 'bg-info text-white';
      case 'on-hold':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const renderCalendarDay = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateKey] || [];
    const dayProjects = projectsByDate[dateKey] || [];
    const allItems = [...dayTasks, ...dayProjects];
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isTodayDate = isToday(day);

    return (
      <div
        key={day.toISOString()}
        className={cn(
          "min-h-[120px] p-2 border border-gray-200 bg-white hover:bg-gray-50 transition-colors",
          !isCurrentMonth && "bg-gray-50 text-gray-400",
          isTodayDate && "bg-blue-50 border-primary ring-1 ring-primary"
        )}
      >
        {/* Date Header */}
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "text-sm font-medium",
            isTodayDate && "text-primary font-semibold",
            !isCurrentMonth && "text-gray-400"
          )}>
            {format(day, 'd')}
          </span>
          {isTodayDate && (
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-1">
          {allItems.slice(0, 3).map((item, index) => (
            <div
              key={`${item.type}-${item.Id}`}
              onClick={() => item.type === 'task' ? onTaskClick(item) : null}
              className={cn(
                "text-xs p-1 rounded cursor-pointer truncate transition-all hover:shadow-sm",
                item.type === 'project' 
                  ? getStatusColor(item.status)
                  : getPriorityColor(item.priority),
                item.isOverdue && "ring-1 ring-red-500 ring-opacity-50",
                item.type === 'task' && "hover:scale-105"
              )}
              title={`${item.type === 'project' ? 'Project' : 'Task'}: ${item.title || item.name}`}
            >
              <div className="flex items-center space-x-1">
                <ApperIcon 
                  name={item.type === 'project' ? 'FolderOpen' : 'CheckSquare2'} 
                  size={10} 
                />
                <span className="truncate">
                  {item.title || item.name}
                </span>
              </div>
            </div>
          ))}
          
          {allItems.length > 3 && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{allItems.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <ApperIcon name="Loader2" size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Calendar
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            
            <h3 className="font-display font-semibold text-lg min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
          >
            Today
          </Button>
          <Button onClick={() => onCreateTask({})}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map(renderCalendarDay)}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <ApperIcon name="FolderOpen" size={12} />
              <div className="w-3 h-3 bg-info rounded"></div>
            </div>
            <span className="text-gray-600">Project Deadlines</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <ApperIcon name="CheckSquare2" size={12} />
              <div className="w-3 h-3 bg-error rounded"></div>
            </div>
            <span className="text-gray-600">High Priority Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <ApperIcon name="CheckSquare2" size={12} />
              <div className="w-3 h-3 bg-warning rounded"></div>
            </div>
            <span className="text-gray-600">Medium Priority Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <ApperIcon name="CheckSquare2" size={12} />
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
            </div>
            <span className="text-gray-600">Low Priority Tasks</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Click on tasks to edit • Items with red outline are overdue • Blue highlighted date is today
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="CheckSquare2" size={16} className="text-primary" />
            <span className="text-sm font-medium text-gray-600">Total Tasks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {tasks.length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="FolderOpen" size={16} className="text-info" />
            <span className="text-sm font-medium text-gray-600">Active Projects</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {projects.filter(p => p.status !== 'completed').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="AlertTriangle" size={16} className="text-error" />
            <span className="text-sm font-medium text-gray-600">Overdue</span>
          </div>
          <div className="text-2xl font-bold text-error mt-1">
            {tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completed').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Calendar" size={16} className="text-success" />
            <span className="text-sm font-medium text-gray-600">Due Today</span>
          </div>
          <div className="text-2xl font-bold text-success mt-1">
            {tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), new Date())).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;