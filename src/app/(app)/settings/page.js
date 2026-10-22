import { SettingsView } from "@/features/settings/settings-view";

export const metadata = { title: "Settings" };

// Keep preferences inside the authenticated workspace shell and reuse its shared navigation.
export default function SettingsPage() {
  return <SettingsView />;
}
