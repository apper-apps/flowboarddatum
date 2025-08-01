import React from "react";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const PrioritySelect = ({ value, onChange, className, ...props }) => {
  const priorities = [
    { value: "low", label: "Low", variant: "low" },
    { value: "medium", label: "Medium", variant: "medium" },
    { value: "high", label: "High", variant: "high" }
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value} onChange={onChange} {...props}>
        <option value="">Select Priority</option>
        {priorities.map(priority => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </Select>
      {value && (
        <Badge variant={value}>
          {priorities.find(p => p.value === value)?.label}
        </Badge>
      )}
    </div>
  );
};

export default PrioritySelect;