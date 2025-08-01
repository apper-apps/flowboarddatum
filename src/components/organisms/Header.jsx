import React from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Header = ({ onMenuToggle, searchValue, onSearchChange }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/projects":
        return "Projects";
      case "/my-tasks":
        return "My Tasks";
      case "/team":
        return "Team";
      case "/reports":
        return "Reports";
      default:
        if (location.pathname.startsWith("/projects/")) {
          return "Project Board";
        }
        return "Dashboard";
    }
  };

  return (
    <header className="glass-effect border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <ApperIcon name="Menu" size={20} />
        </Button>
        
        <div>
          <h1 className="font-display font-semibold text-xl text-gray-900">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <SearchBar
          placeholder="Search projects, tasks..."
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <ApperIcon name="Bell" size={18} />
        </Button>
        
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <ApperIcon name="Settings" size={18} />
        </Button>
        
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <Avatar name="John Doe" size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;