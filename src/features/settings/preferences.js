import { DASHBOARD_RANGES } from "@/features/dashboard/ranges";

// Keep browser-only preferences separate from server-owned clinic and account data.
export const PREFERENCES_KEY = "doctor-tracker.preferences.v1";
export const DEFAULT_PREFERENCES = { dashboardRange: "12m", theme: "system" };

// Accept only known values so stale or manually edited browser data cannot break controls.
export function readPreferences() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) ?? "{}");
    return {
      dashboardRange: DASHBOARD_RANGES.includes(saved.dashboardRange)
        ? saved.dashboardRange
        : DEFAULT_PREFERENCES.dashboardRange,
      theme: ["system", "light", "dark"].includes(saved.theme)
        ? saved.theme
        : DEFAULT_PREFERENCES.theme,
    };
  } catch {
    // Storage may be unavailable or malformed; keep the app on safe defaults.
    return DEFAULT_PREFERENCES;
  }
}

// Persist a deliberately small set of non-sensitive, user-facing defaults on this device.
export function writePreferences(preferences) {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}
