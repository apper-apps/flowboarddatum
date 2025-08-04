import React from 'react';
import { format } from 'date-fns';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const MilestoneCard = ({ milestone, onEdit, onDelete, className }) => {
  const isOverdue = milestone.status !== 'Completed' && new Date(milestone.dueDate) < new Date();
  const isCompleted = milestone.status === 'Completed';

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return 'AlertTriangle';
      case 'Medium': return 'AlertCircle';
      case 'Low': return 'Circle';
      default: return 'Circle';
    }
  };

  return (
    <Card className={cn(
      "p-6 card-hover-lift",
      isOverdue && !isCompleted && "border-l-4 border-l-red-500",
      isCompleted && "border-l-4 border-l-green-500",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
            <Badge variant={getStatusVariant(milestone.status)}>
              {milestone.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium text-gray-700">{milestone.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isCompleted ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(milestone)}
            className="text-gray-600 hover:text-blue-600"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(milestone.Id)}
            className="text-gray-600 hover:text-red-600"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <ApperIcon 
            name={getPriorityIcon(milestone.priority)} 
            size={14} 
            className={getPriorityColor(milestone.priority)}
          />
          <span className="text-gray-600">Priority:</span>
          <span className={cn("font-medium", getPriorityColor(milestone.priority))}>
            {milestone.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <ApperIcon 
            name="Calendar" 
            size={14} 
            className={isOverdue ? "text-red-500" : "text-gray-500"}
          />
          <span className="text-gray-600">Due:</span>
          <span className={cn(
            "font-medium",
            isOverdue && !isCompleted ? "text-red-600" : "text-gray-900"
          )}>
            {format(new Date(milestone.dueDate), "MMM dd, yyyy")}
          </span>
        </div>
        
        {milestone.completedAt && (
          <div className="flex items-center gap-2">
            <ApperIcon name="CheckCircle" size={14} className="text-green-500" />
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium text-green-600">
              {format(new Date(milestone.completedAt), "MMM dd")}
            </span>
          </div>
        )}
      </div>
      
      {isOverdue && !isCompleted && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <ApperIcon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Overdue</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MilestoneCard;