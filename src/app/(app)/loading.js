import { PageLoadingSkeleton } from "@/components/layout/app-shell-skeleton";

// Next.js automatically uses this lightweight fallback during streamed app-route navigation.
export default function AppLoading() {
  return <PageLoadingSkeleton />;
}
