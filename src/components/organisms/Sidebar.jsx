import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Projects", href: "/projects", icon: "FolderOpen" },
    { name: "My Tasks", href: "/my-tasks", icon: "CheckSquare" },
    { name: "Team", href: "/team", icon: "Users" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      <ApperIcon name={item.icon} size={18} />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:h-screen lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" className="text-white" size={18} />
            </div>
            <span className="font-display font-bold text-xl gradient-text">
              FlowBoard
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="text-white" size={18} />
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                FlowBoard
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;