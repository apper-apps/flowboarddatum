import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

const ProjectCard = ({ project, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.Id}`);
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "active": return "success";
      case "completed": return "info";
      case "on hold": return "warning";
      case "planning": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "active": return "Play";
      case "completed": return "CheckCircle";
      case "on hold": return "Pause";
      case "planning": return "Calendar";
      default: return "Circle";
    }
  };

  return (
    <Card 
      hover 
      className={cn("p-6 cursor-pointer animate-fade-in-up", className)}
      onClick={handleClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {project.description}
            </p>
          </div>
          <Badge variant={getStatusVariant(project.status)} className="ml-2">
            <ApperIcon name={getStatusIcon(project.status)} size={12} className="mr-1" />
            {project.status}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium gradient-text">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <ApperIcon name="Calendar" size={14} />
            <span>Due {format(new Date(project.endDate), "MMM dd")}</span>
          </div>
          <div className="flex items-center gap-1">
            <ApperIcon name="Clock" size={14} />
            <span>Created {format(new Date(project.createdAt), "MMM dd")}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;