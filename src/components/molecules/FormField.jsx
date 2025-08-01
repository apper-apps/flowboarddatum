import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "input", 
  error, 
  className,
  children,
  ...props 
}) => {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return <Textarea error={error} {...props} />;
      case "select":
        return <Select error={error} {...props}>{children}</Select>;
      default:
        return <Input type={type} error={error} {...props} />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      {renderInput()}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;