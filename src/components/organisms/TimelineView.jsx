import React, { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays, addDays, parseISO, isValid } from "date-fns";
import TaskCard from "@/components/molecules/TaskCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const TimelineView = ({ tasks, onTaskClick, onTaskUpdate, onCreateTask }) => {
  const [timelineRange, setTimelineRange] = useState("month"); // "week", "month", "quarter"
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate date range based on timeline range
  const dateRange = useMemo(() => {
    const today = new Date();
    let start, end;

    switch (timelineRange) {
      case "week":
        start = startOfWeek(currentDate);
        end = endOfWeek(currentDate);
        break;
      case "month":
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case "quarter":
        const quarter = Math.floor(currentDate.getMonth() / 3);
        start = new Date(currentDate.getFullYear(), quarter * 3, 1);
        end = new Date(currentDate.getFullYear(), quarter * 3 + 3, 0);
        break;
      default:
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }

    return { start, end };
  }, [currentDate, timelineRange]);

  // Generate date headers
  const dateHeaders = useMemo(() => {
    return eachDayOfInterval(dateRange);
  }, [dateRange]);

  // Process tasks with timeline positioning
  const timelineTasks = useMemo(() => {
    return tasks
      .filter(task => task.startDate && task.dueDate)
      .map(task => {
        const startDate = parseISO(task.startDate);
        const dueDate = parseISO(task.dueDate);
        
        if (!isValid(startDate) || !isValid(dueDate)) {
          return null;
        }

        const daysSinceStart = differenceInDays(startDate, dateRange.start);
        const duration = differenceInDays(dueDate, startDate) + 1;
        const totalDays = differenceInDays(dateRange.end, dateRange.start) + 1;

        // Calculate positioning
        const leftPercent = Math.max(0, (daysSinceStart / totalDays) * 100);
        const widthPercent = Math.min(100 - leftPercent, (duration / totalDays) * 100);

        return {
          ...task,
          timelineData: {
            style: {
              position: 'absolute',
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
            },
            duration: `${duration} day${duration !== 1 ? 's' : ''}`,
            showDuration: timelineRange === "month" || timelineRange === "quarter"
          }
        };
      })
      .filter(Boolean);
  }, [tasks, dateRange, timelineRange]);

  // Group tasks by assignee for better organization
  const tasksByAssignee = useMemo(() => {
    const groups = {};
    timelineTasks.forEach(task => {
      if (!groups[task.assignee]) {
        groups[task.assignee] = [];
      }
      groups[task.assignee].push(task);
    });
    return groups;
  }, [timelineTasks]);

  const handleRangeChange = (range) => {
    setTimelineRange(range);
  };

  const handleDateNavigation = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (timelineRange) {
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "quarter":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 3 : -3));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleTaskDrop = async (e, newDate) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("text/plain"));
    const task = tasks.find(t => t.Id === taskId);
    
    if (!task || !task.startDate || !task.dueDate) return;

    try {
      const originalStart = parseISO(task.startDate);
      const originalDue = parseISO(task.dueDate);
      const duration = differenceInDays(originalDue, originalStart);
      
      const updatedTask = {
        ...task,
        startDate: newDate.toISOString().split('T')[0],
        dueDate: addDays(newDate, duration).toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
      
      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error("Error updating task dates:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Range Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {["week", "month", "quarter"].map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-all capitalize",
                  timelineRange === range
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateNavigation("prev")}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            
            <h3 className="font-display font-semibold text-lg min-w-[200px] text-center">
              {timelineRange === "week" 
                ? `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`
                : timelineRange === "month"
                ? format(currentDate, "MMMM yyyy")
                : `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`
              }
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDateNavigation("next")}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        <Button onClick={() => onCreateTask({})}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Task
        </Button>
      </div>

      {/* Timeline Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Date Headers */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <div className="w-48 px-4 py-3 font-medium text-gray-700 border-r border-gray-200">
              Assignee
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {dateHeaders.map((date, index) => (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "flex-1 px-2 py-3 text-center text-sm border-r border-gray-200 last:border-r-0",
                      "min-w-[40px]"
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleTaskDrop(e, date)}
                  >
                    <div className="font-medium text-gray-700">
                      {format(date, timelineRange === "week" ? "EEE" : "d")}
                    </div>
                    {timelineRange === "week" && (
                      <div className="text-xs text-gray-500 mt-1">
                        {format(date, "MMM d")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-gray-200">
          {Object.keys(tasksByAssignee).length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <div className="text-center">
                <ApperIcon name="CalendarDays" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No scheduled tasks</p>
                <p className="text-sm">Tasks need start and due dates to appear in timeline view</p>
                <Button 
                  variant="ghost" 
                  className="mt-4"
                  onClick={() => onCreateTask({})}
                >
                  Create your first scheduled task
                </Button>
              </div>
            </div>
          ) : (
            Object.entries(tasksByAssignee).map(([assignee, assigneeTasks]) => (
              <div key={assignee} className="flex hover:bg-gray-50 transition-colors">
                <div className="w-48 px-4 py-4 border-r border-gray-200 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                    {assignee.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{assignee}</div>
                    <div className="text-xs text-gray-500">
                      {assigneeTasks.length} task{assigneeTasks.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 relative py-4 min-h-[80px]">
                  {assigneeTasks.map((task, index) => (
                    <div
                      key={task.Id}
                      className="absolute"
                      style={{
                        ...task.timelineData.style,
                        top: `${index * 20 + 8}px`,
                        zIndex: 10 - index
                      }}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                        variant="timeline"
                        timelineData={task.timelineData}
                        className="shadow-sm hover:shadow-md hover:z-20 relative"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", task.Id.toString());
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Timeline Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-error rounded-full"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning rounded-full"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span>Low Priority</span>
        </div>
        <div className="text-gray-500">
          Drag tasks to reschedule • Click to edit details
        </div>
      </div>
    </div>
  );
};

export default TimelineView;