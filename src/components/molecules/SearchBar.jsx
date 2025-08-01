import React, { useState } from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  value,
  onChange 
}) => {
  const [localValue, setLocalValue] = useState(value || "");

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        size={16} 
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value !== undefined ? value : localValue}
        onChange={handleChange}
        className="pl-10 pr-4"
      />
    </div>
  );
};

export default SearchBar;