// Both validation failures and duplicate-record conflicts use backend fieldErrors.
// Return whether anything was mapped so callers can show a general error when needed.
export function applyServerErrors(error, setError) {
  const entries = Object.entries(error?.fieldErrors ?? {});
  let handled = false;
  for (const [field, messages] of entries) {
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (message) {
      setError(field, { type: "server", message });
      handled = true;
    }
  }
  return handled;
}
