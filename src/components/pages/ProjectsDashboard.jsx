import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ProjectCard from "@/components/molecules/ProjectCard";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { projectService } from "@/services/api/projectService";

const ProjectsDashboard = () => {
  const { searchValue } = useOutletContext() || {};
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchValue || 
      project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      project.description.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesFilter = filter === "all" || 
      project.status.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === "Active").length,
    completed: projects.filter(p => p.status === "Completed").length,
    onHold: projects.filter(p => p.status === "On Hold").length
  };

  if (loading) {
    return <Loading variant="grid" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to load projects"
        message={error}
        onRetry={loadProjects}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Projects Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your projects in one place
          </p>
        </div>
        
        <Button>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold gradient-text mt-2">{projectStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="FolderOpen" className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-success mt-2">{projectStats.active}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-success/10 to-success/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Play" className="text-success" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-info mt-2">{projectStats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-info/10 to-info/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="text-info" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Hold</p>
              <p className="text-3xl font-bold text-warning mt-2">{projectStats.onHold}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-warning/10 to-warning/20 rounded-lg flex items-center justify-center">
              <ApperIcon name="Pause" className="text-warning" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        {[
          { key: "all", label: "All Projects", count: projectStats.total },
          { key: "active", label: "Active", count: projectStats.active },
          { key: "completed", label: "Completed", count: projectStats.completed },
          { key: "on hold", label: "On Hold", count: projectStats.onHold },
          { key: "planning", label: "Planning", count: projects.filter(p => p.status === "Planning").length }
        ].map(status => (
          <button
            key={status.key}
            onClick={() => setFilter(status.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === status.key
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label} ({status.count})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Empty
          icon="FolderPlus"
          title="No projects found"
          message={
            searchValue 
              ? `No projects match "${searchValue}". Try adjusting your search or filters.`
              : filter !== "all"
              ? `No projects with status "${filter}". Try changing the filter or create a new project.`
              : "Get started by creating your first project to organize your team's work."
          }
          actionLabel="Create Project"
          onAction={() => console.log("Create project")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={project.Id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;