"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { cn } from "@/lib/utils";

// One accessible Dialog changes geometry with CSS: a bottom sheet on mobile and modal on desktop.
// Keeping one tree avoids a hydration mismatch while still preserving focus lock, Escape and focus return.
function ResponsiveDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  contentClassName,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-2xl border bg-background p-5 shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:top-1/2 md:right-auto md:bottom-auto md:left-1/2 md:w-[calc(100%-2rem)] md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:p-6 md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95",
            contentClassName,
          )}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/25 md:hidden" />
          <div className="pr-9">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </Dialog.Description>
            ) : null}
          </div>
          <Dialog.Close
            type="button"
            className="absolute top-4 right-4 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X aria-hidden="true" className="size-4" />
            <span className="sr-only">Close dialog</span>
          </Dialog.Close>
          <div className="mt-5">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { ResponsiveDialog };
