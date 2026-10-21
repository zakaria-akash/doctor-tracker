"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clearSessionAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      // Clear the server cookie before removing client-side state.
      await clearSessionAction();
      // Remove private query data and preserved route state before another user signs in.
      queryClient.clear();
      window.location.replace("/login");
    } catch {
      setPending(false);
      toast.error("Unable to sign out. Please try again.");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={signOut} disabled={pending}>
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
