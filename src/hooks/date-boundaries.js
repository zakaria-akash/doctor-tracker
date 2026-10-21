// nuqs ISO dates represent midnight UTC; rebuild their calendar day in the user's
// local zone before converting to UTC so a date filter includes the full local day.
export function localDayBoundary(date, end = false) {
  if (!date) return undefined;
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    end ? 23 : 0,
    end ? 59 : 0,
    end ? 59 : 0,
    end ? 999 : 0,
  ).toISOString();
}
