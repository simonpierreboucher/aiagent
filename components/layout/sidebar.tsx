"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PlusCircle, MessageSquare, LineChart, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: PlusCircle,
      href: "/dashboard/create",
      label: "Create Bot",
      active: pathname === "/dashboard/create",
    },
    {
      icon: MessageSquare,
      href: "/dashboard/chats",
      label: "Chats",
      active: pathname === "/dashboard/chats" || pathname.startsWith("/dashboard/chat/"),
    },
    {
      icon: LineChart,
      href: "/dashboard/analytics",
      label: "Analytics",
      active: pathname === "/dashboard/analytics",
    },
    {
      icon: Settings,
      href: "/dashboard/settings",
      label: "Settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className={cn("flex h-full flex-col justify-between bg-gray-900 text-white", className)}>
      <div className="px-3 py-4">
        <div className="mb-6 flex items-center px-3 py-3">
          <Logo size="md" href="/dashboard" />
        </div>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-800",
                route.active ? "bg-gray-800 text-white" : "text-gray-300"
              )}
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
} 