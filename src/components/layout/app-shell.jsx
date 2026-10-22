"use client";

import { useState } from "react";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  HeartPulse,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
  Sun,
  Users,
  X,
} from "lucide-react";
import { Dialog, DropdownMenu, Tooltip } from "radix-ui";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { clearSessionAction } from "@/app/(auth)/login/actions";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// The same navigation source drives both desktop and mobile menus, which keeps
// labels, icons, active states and future route changes synchronized.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

function isActiveRoute(pathname, href) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

function PendingNavigationIndicator() {
  // Next.js requires this hook to be rendered below its corresponding Link.
  const { pending } = useLinkStatus();

  return (
    <span className="ml-auto flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
      <LoaderCircle
        className={cn(
          "size-3.5 opacity-0 transition-opacity",
          pending && "animate-spin opacity-70 motion-reduce:animate-none",
        )}
      />
    </span>
  );
}

function NavigationLink({ item, collapsed, onNavigate }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = isActiveRoute(pathname, item.href);

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4.5 shrink-0" aria-hidden="true" />
      <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
      <PendingNavigationIndicator />
    </Link>
  );

  // A tooltip preserves discoverability when desktop navigation shows icons only.
  if (!collapsed) return link;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={10}
          className="z-60 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg"
        >
          {item.label}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function SidebarContents({ collapsed = false, onNavigate }) {
  const user = useUser();

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* The compact brand remains recognizable while the desktop rail is collapsed. */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <HeartPulse className="size-5" aria-hidden="true" />
        </span>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold">Doctor Tracker</p>
            <p className="truncate text-xs text-muted-foreground">Clinical operations</p>
          </div>
        )}
      </div>

      {/* Primary navigation fills the available height and keeps touch targets at 40px. */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* The signed-in summary confirms which account owns the current session. */}
      <div className={cn("border-t border-sidebar-border p-3", collapsed && "flex justify-center")}>
        <div
          className={cn("flex min-w-0 items-center", collapsed ? "justify-center" : "gap-3")}
          title={collapsed ? `${user.name} · ${user.role}` : undefined}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
            {getInitials(user.name) || "DT"}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {/* CSS selects the correct icon from the pre-hydration theme class, avoiding a flash. */}
      <Moon className="size-4.5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4.5 dark:block" aria-hidden="true" />
    </Button>
  );
}

function UserMenu() {
  const user = useUser();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);

    try {
      // Remove the HttpOnly session first, then discard cached private records.
      await clearSessionAction();
      queryClient.clear();
      // A full replacement also drops preserved client layout and route state.
      window.location.replace("/login");
    } catch {
      setSigningOut(false);
      toast.error("Unable to sign out. Please try again.");
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-2 px-2"
          aria-label="Open account menu"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
            {getInitials(user.name) || "DT"}
          </span>
          <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">
            {user.name}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-60 w-64 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl outline-none"
        >
          {/* Account metadata is informational and intentionally not interactive. */}
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary capitalize">
              {user.role}
            </span>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            disabled={signingOut}
            onSelect={signOut}
            className="flex cursor-default items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50"
          >
            {signingOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            {signingOut ? "Signing out…" : "Sign out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function formatBreadcrumbLabel(segment, parentSegment, isDetail) {
  if (isDetail && parentSegment === "doctors") return "Doctor details";
  if (isDetail && parentSegment === "patients") return "Patient details";

  return decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ href: "/dashboard", label: "Dashboard" }];

  // Convert route segments into stable labels and hide record identifiers in detail routes.
  segments.forEach((segment, index) => {
    if (segment === "dashboard" && index === 0) return;

    const href = `/${segments.slice(0, index + 1).join("/")}`;
    crumbs.push({
      href,
      label: formatBreadcrumbLabel(segment, segments[index - 1], index > 0),
    });
  });

  return (
    <nav className="min-w-0" aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <span className="text-muted-foreground/60" aria-hidden="true">
                  /
                </span>
              )}
              {current ? (
                <span className="truncate font-medium text-foreground" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function AppHeader({ collapsed, onNavigationToggle }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/88 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/72 md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onNavigationToggle}
        aria-label="Toggle navigation"
        title="Toggle navigation"
      >
        <Menu className="size-5 md:hidden" aria-hidden="true" />
        {collapsed ? (
          <PanelLeftOpen className="hidden size-5 md:block" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="hidden size-5 md:block" aria-hidden="true" />
        )}
      </Button>
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}

export function AppShell({ children }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleNavigation() {
    if (isMobile) setMobileOpen(true);
    else setCollapsed((current) => !current);
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop navigation remains in normal flow, so content never hides beneath it. */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block",
          collapsed ? "w-18" : "w-64",
        )}
      >
        <SidebarContents collapsed={collapsed} />
      </aside>

      {/* Radix Dialog provides focus trapping, Escape handling and an accessible mobile drawer. */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(86vw,20rem)] border-r border-sidebar-border bg-sidebar shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
            <Dialog.Title className="sr-only">Main navigation</Dialog.Title>
            <Dialog.Description className="sr-only">
              Navigate between Doctor Tracker sections.
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10"
                aria-label="Close navigation"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
            <SidebarContents onNavigate={() => setMobileOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* The persistent header surrounds a bounded, responsive page content area. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader collapsed={collapsed} onNavigationToggle={toggleNavigation} />
        <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
