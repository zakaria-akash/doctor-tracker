// Share the backend's accepted range values between the URL parser and server validation.
export const DASHBOARD_RANGES = ["7d", "30d", "90d", "12m", "all"];

// Human-readable labels are presentation only; API requests keep the compact values above.
export const RANGE_LABELS = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  all: "All time",
};
