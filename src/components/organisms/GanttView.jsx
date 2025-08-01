import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format, startOfDay, endOfDay, addDays, addWeeks, addMonths, differenceInDays, parseISO, isValid, isSameDay, subDays, isAfter, isBefore } from 'date-fns';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';
import { toast } from 'react-toastify';

const GanttView = ({ tasks = [], project, onTaskClick, onTaskUpdate, onCreateTask }) => {
  const [zoom, setZoom] = useState('weeks'); // days, weeks, months
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragTaskId, setDragTaskId] = useState(null);
  const [resizeMode, setResizeMode] = useState(null); // 'start' or 'end'
  const ganttRef = useRef(null);
  const timelineRef = useRef(null);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (!tasks.length && !project) return { start: new Date(), end: addDays(new Date(), 30) };
    
    const allDates = [];
    
    // Add project dates
    if (project?.startDate) allDates.push(parseISO(project.startDate));
    if (project?.endDate) allDates.push(parseISO(project.endDate));
    
    // Add task dates
    tasks.forEach(task => {
      if (task.startDate && isValid(parseISO(task.startDate))) {
        allDates.push(parseISO(task.startDate));
      }
      if (task.dueDate && isValid(parseISO(task.dueDate))) {
        allDates.push(parseISO(task.dueDate));
      }
    });
    
    if (allDates.length === 0) {
      return { start: new Date(), end: addDays(new Date(), 30) };
    }
    
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    // Add buffer
    const start = subDays(startOfDay(minDate), 7);
    const end = addDays(endOfDay(maxDate), 7);
    
    return { start, end };
  }, [tasks, project]);

  // Generate timeline columns
  const timelineColumns = useMemo(() => {
    const columns = [];
    const { start, end } = dateRange;
    let current = new Date(start);
    
    while (current <= end) {
      columns.push(new Date(current));
      
      if (zoom === 'days') {
        current = addDays(current, 1);
      } else if (zoom === 'weeks') {
        current = addWeeks(current, 1);
      } else {
        current = addMonths(current, 1);
      }
    }
    
    return columns;
  }, [dateRange, zoom]);

  // Calculate task position and width
  const getTaskStyle = (task) => {
    const startDate = task.startDate ? parseISO(task.startDate) : null;
    const endDate = task.dueDate ? parseISO(task.dueDate) : null;
    
    if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
      return { display: 'none' };
    }
    
    const totalDays = differenceInDays(dateRange.end, dateRange.start);
    const taskStartDays = differenceInDays(startDate, dateRange.start);
    const taskDuration = differenceInDays(endDate, startDate) + 1;
    
    const leftPercent = (taskStartDays / totalDays) * 100;
    const widthPercent = (taskDuration / totalDays) * 100;
    
    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(1, widthPercent)}%`,
      display: 'block'
    };
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-purple-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Handle task drag start
  const handleTaskMouseDown = (e, task, mode = 'move') => {
    e.preventDefault();
    setIsDragging(true);
    setDragTaskId(task.Id);
    setResizeMode(mode);
    setDragStartX(e.clientX);
    setSelectedTask(task);
  };

  // Handle mouse move for dragging/resizing
  const handleMouseMove = (e) => {
    if (!isDragging || !dragTaskId) return;
    
    const deltaX = e.clientX - dragStartX;
    const timelineWidth = timelineRef.current?.offsetWidth || 1;
    const totalDays = differenceInDays(dateRange.end, dateRange.start);
    const dayWidth = timelineWidth / totalDays;
    const daysDelta = Math.round(deltaX / dayWidth);
    
    if (Math.abs(daysDelta) > 0) {
      const task = tasks.find(t => t.Id === dragTaskId);
      if (!task || !task.startDate || !task.dueDate) return;
      
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.dueDate);
      
      let newStartDate, newEndDate;
      
      if (resizeMode === 'start') {
        newStartDate = addDays(startDate, daysDelta);
        newEndDate = endDate;
        if (isAfter(newStartDate, newEndDate)) {
          newStartDate = subDays(newEndDate, 1);
        }
      } else if (resizeMode === 'end') {
        newStartDate = startDate;
        newEndDate = addDays(endDate, daysDelta);
        if (isBefore(newEndDate, newStartDate)) {
          newEndDate = addDays(newStartDate, 1);
        }
      } else {
        // Move entire task
        newStartDate = addDays(startDate, daysDelta);
        newEndDate = addDays(endDate, daysDelta);
      }
      
      const updatedTask = {
        ...task,
        startDate: newStartDate.toISOString(),
        dueDate: newEndDate.toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onTaskUpdate(updatedTask);
      setDragStartX(e.clientX);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging && dragTaskId) {
      toast.success('Task updated successfully');
    }
    setIsDragging(false);
    setDragTaskId(null);
    setResizeMode(null);
  };

  // Handle zoom change
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    toast.info(`Zoom changed to ${newZoom}`);
  };

  // Today marker position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const totalDays = differenceInDays(dateRange.end, dateRange.start);
    const todayDays = differenceInDays(today, dateRange.start);
    return (todayDays / totalDays) * 100;
  }, [dateRange]);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStartX, dragTaskId, resizeMode]);

  return (
    <div className="gantt-container bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header Controls */}
      <div className="gantt-header p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Gantt Chart</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Zoom:</span>
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => handleZoomChange('days')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded transition-all',
                    zoom === 'days' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Days
                </button>
                <button
                  onClick={() => handleZoomChange('weeks')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded transition-all',
                    zoom === 'weeks' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Weeks
                </button>
                <button
                  onClick={() => handleZoomChange('months')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded transition-all',
                    zoom === 'months' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Months
                </button>
              </div>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => onCreateTask({ 
              startDate: new Date().toISOString(),
              dueDate: addDays(new Date(), 7).toISOString()
            })}
            className="flex items-center"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-chart" ref={ganttRef}>
        {/* Timeline Header */}
        <div className="gantt-timeline-header sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="grid grid-cols-timeline">
            <div className="gantt-task-header p-4 border-r border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Tasks</span>
            </div>
            <div className="gantt-dates-header relative overflow-x-auto" ref={timelineRef}>
              <div className="flex min-w-full">
                {timelineColumns.map((date, index) => (
                  <div
                    key={index}
                    className="gantt-date-column flex-1 min-w-20 p-2 text-center border-r border-gray-100 last:border-r-0"
                    style={{ minWidth: zoom === 'days' ? '60px' : zoom === 'weeks' ? '80px' : '100px' }}
                  >
                    <div className="text-xs font-medium text-gray-700">
                      {zoom === 'days' 
                        ? format(date, 'MMM dd')
                        : zoom === 'weeks'
                        ? format(date, 'MMM dd')
                        : format(date, 'MMM yyyy')
                      }
                    </div>
                    {zoom === 'days' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {format(date, 'EEE')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Today Marker */}
              {todayPosition >= 0 && todayPosition <= 100 && (
                <div 
                  className="gantt-today-marker"
                  style={{ left: `${todayPosition}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Project Row (if available) */}
        {project && (
          <div className="gantt-project-row border-b border-gray-100">
            <div className="grid grid-cols-timeline">
              <div className="gantt-task-info p-4 border-r border-gray-200 bg-blue-50">
                <div className="flex items-center">
                  <ApperIcon name="Folder" size={16} className="text-blue-600 mr-2" />
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500">Project</div>
                  </div>
                </div>
              </div>
              <div className="gantt-timeline-area relative p-2">
                {project.startDate && project.endDate && (
                  <div
                    className="gantt-project-bar bg-blue-200 border-2 border-blue-400 rounded-lg h-8 flex items-center justify-center relative"
                    style={getTaskStyle({
                      startDate: project.startDate,
                      dueDate: project.endDate
                    })}
                  >
                    <div className="text-xs font-medium text-blue-800 truncate px-2">
                      {project.name}
                    </div>
                    <div 
                      className="gantt-progress-bar bg-blue-500 rounded h-full absolute left-0 top-0"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task Rows */}
        <div className="gantt-tasks">
          {tasks.map((task) => (
            <div 
              key={task.Id} 
              className={cn(
                'gantt-task-row border-b border-gray-50 hover:bg-gray-25 transition-colors',
                selectedTask?.Id === task.Id && 'bg-blue-50'
              )}
            >
              <div className="grid grid-cols-timeline">
                {/* Task Info */}
                <div className="gantt-task-info p-4 border-r border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">{task.title}</span>
                        <Badge 
                          variant={getStatusColor(task.status).replace('bg-', '')}
                          size="sm"
                        >
                          {task.status}
                        </Badge>
                      </div>
                      {task.assignee && (
                        <div className="text-xs text-gray-500 mt-1">
                          Assigned to: {task.assignee.name}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={cn('w-2 h-2 rounded-full', getPriorityColor(task.priority))} />
                        <span className="text-xs text-gray-500">{task.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Area */}
                <div className="gantt-timeline-area relative p-2 min-h-16">
                  {task.startDate && task.dueDate && (
                    <div
                      className={cn(
                        'gantt-task-bar rounded-lg h-8 flex items-center relative cursor-move transition-all',
                        getStatusColor(task.status),
                        'hover:shadow-lg',
                        isDragging && dragTaskId === task.Id && 'shadow-xl scale-105'
                      )}
                      style={getTaskStyle(task)}
                      onMouseDown={(e) => handleTaskMouseDown(e, task)}
                      onClick={() => onTaskClick(task)}
                      title={`${task.title} (${format(parseISO(task.startDate), 'MMM dd')} - ${format(parseISO(task.dueDate), 'MMM dd')})`}
                    >
                      {/* Task Content */}
                      <div className="flex items-center justify-between w-full px-2 text-white">
                        <span className="text-xs font-medium truncate">{task.title}</span>
                        <span className="text-xs opacity-75">
                          {task.progress || 0}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div 
                        className="gantt-task-progress absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-b-lg"
                        style={{ width: `${task.progress || 0}%` }}
                      />

                      {/* Resize Handles */}
                      <div
                        className="gantt-resize-handle gantt-resize-start absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 hover:opacity-100 bg-white bg-opacity-50"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleTaskMouseDown(e, task, 'start');
                        }}
                      />
                      <div
                        className="gantt-resize-handle gantt-resize-end absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 hover:opacity-100 bg-white bg-opacity-50"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleTaskMouseDown(e, task, 'end');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="gantt-empty-state p-12 text-center">
            <ApperIcon name="BarChart3" size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to display</h3>
            <p className="text-gray-500 mb-4">Create your first task to see it in the Gantt chart</p>
            <Button
              variant="primary"
              onClick={() => onCreateTask({
                startDate: new Date().toISOString(),
                dueDate: addDays(new Date(), 7).toISOString()
              })}
              className="flex items-center mx-auto"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttView;