import { cn } from "@/lib/utils";

// The outer container shares the application's card colors, border and spacing.
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

// Header sections arrange the title and description alongside an optional action.
function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className)} {...props} />;
}

// These text slots keep card headings and supporting descriptions consistent.
function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

// An action occupies the second header column without disrupting the text.
function CardAction({ className, ...props }) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

// Content and footer slots provide consistent horizontal padding and borders.
function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />;
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
