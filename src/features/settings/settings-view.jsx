"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, MonitorCog, RotateCcw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_RANGES, RANGE_LABELS } from "@/features/dashboard/ranges";
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  writePreferences,
} from "@/features/settings/preferences";

const THEME_LABELS = { system: "Use device setting", light: "Light", dark: "Dark" };

// Manage only frontend preferences here; organization-wide settings need backend persistence.
export function SettingsView() {
  const { setTheme } = useTheme();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  // Load preferences after hydration so server and browser render identical initial markup.
  useEffect(() => {
    setPreferences(readPreferences());
    setReady(true);
  }, []);

  function savePreferences(event) {
    event.preventDefault();
    if (!writePreferences(preferences)) {
      toast.error("Could not save preferences in this browser.");
      return;
    }

    setTheme(preferences.theme);
    toast.success("Your preferences have been saved.");
  }

  function resetPreferences() {
    setPreferences(DEFAULT_PREFERENCES);
    setTheme(DEFAULT_PREFERENCES.theme);
    if (writePreferences(DEFAULT_PREFERENCES)) toast.success("Preferences restored to defaults.");
    else toast.error("Could not update preferences in this browser.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Set the defaults for your Doctor Tracker workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <form onSubmit={savePreferences} className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MonitorCog className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <CardTitle>Workspace defaults</CardTitle>
                  <CardDescription>
                    Choose what you see when you open the dashboard.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)] sm:items-center">
                <div>
                  <label htmlFor="default-range" className="text-sm font-medium">
                    Default dashboard date range
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Used when the dashboard URL has no range selected.
                  </p>
                </div>
                <select
                  id="default-range"
                  value={preferences.dashboardRange}
                  disabled={!ready}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      dashboardRange: event.target.value,
                    }))
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  {DASHBOARD_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {RANGE_LABELS[range]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2 border-t pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)] sm:items-center">
                <div>
                  <label htmlFor="appearance" className="text-sm font-medium">
                    Appearance
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Follow your device or choose a theme.
                  </p>
                </div>
                <select
                  id="appearance"
                  value={preferences.theme}
                  disabled={!ready}
                  onChange={(event) =>
                    setPreferences((current) => ({ ...current, theme: event.target.value }))
                  }
                  className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  {Object.entries(THEME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={resetPreferences} disabled={!ready}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Restore defaults
            </Button>
            <Button type="submit" disabled={!ready}>
              <Save className="size-4" aria-hidden="true" />
              Save preferences
            </Button>
          </div>
        </form>

        <Card className="h-fit bg-primary/[0.035]">
          <CardHeader>
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <CardTitle>Just the essentials</CardTitle>
            <CardDescription>
              Your choices are saved in this browser and apply to your workspace on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Clinic-wide settings and team preferences can be added when backend support is ready.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
