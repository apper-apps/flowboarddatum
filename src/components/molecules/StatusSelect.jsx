import React from "react";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const StatusSelect = ({ value, onChange, className, ...props }) => {
  const statuses = [
    { value: "todo", label: "To Do", variant: "default" },
    { value: "in-progress", label: "In Progress", variant: "warning" },
    { value: "review", label: "Review", variant: "info" },
    { value: "done", label: "Done", variant: "success" }
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value} onChange={onChange} {...props}>
        <option value="">Select Status</option>
        {statuses.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Select>
      {value && (
        <Badge variant={statuses.find(s => s.value === value)?.variant}>
          {statuses.find(s => s.value === value)?.label}
        </Badge>
      )}
    </div>
  );
};

export default StatusSelect;