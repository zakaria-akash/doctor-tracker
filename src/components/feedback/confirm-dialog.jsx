"use client";

import { AlertDialog } from "radix-ui";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// ConfirmDialog requires an explicit destructive confirmation and keeps focus trapped while open.
function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  pending = false,
}) {
  // Keep keyboard focus anchored even when a row opens this controlled dialog without a Trigger.
  const returnFocusRef = useRef(null);
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialog.Content
          onOpenAutoFocus={() => {
            returnFocusRef.current = document.activeElement;
          }}
          onCloseAutoFocus={(event) => {
            if (trigger) return;
            event.preventDefault();
            const target = returnFocusRef.current;
            if (target?.isConnected && target !== document.body) target.focus();
            else document.getElementById("main-content")?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95"
        >
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="outline" disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={(event) => {
                  // Prevent auto-close so the parent can close only after a successful mutation.
                  event.preventDefault();
                  onConfirm?.();
                }}
              >
                {pending ? <Spinner label="Confirming" /> : null}
                {pending ? "Working…" : confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export { ConfirmDialog };
