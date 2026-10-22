import { cloneElement, isValidElement } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// FormField connects labels, supporting text and errors to the supplied native/Radix control.
function FormField({ id, label, description, error, required = false, children, className }) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  // Inject accessibility attributes when the child is a single React element.
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        "aria-invalid": children.props["aria-invalid"] ?? Boolean(error),
        "aria-required": children.props["aria-required"] ?? (required || undefined),
        "aria-describedby": children.props["aria-describedby"] ?? describedBy,
      })
    : children;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
      </Label>
      {control}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error.message ?? error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };
