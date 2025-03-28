"use client";

import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { 
  Home, 
  Plus, 
  MessageSquare, 
  BarChart, 
  Settings, 
  Database,
  History,
  LineChart,
  Paintbrush,
  Code
} from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/ui/logo";

// Client-side components doivent être importés dynamiquement
import dynamic from "next/dynamic";

const DashboardNav = dynamic(() => import("@/components/dashboard/dashboard-nav"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full animate-pulse bg-muted/20"></div>
});

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Create",
    icon: Plus,
    href: "/dashboard/create",
    color: "text-violet-500",
  },
  {
    label: "Appearance",
    icon: Paintbrush,
    href: "/dashboard/appearance",
    color: "text-pink-500",
  },
  {
    label: "Integration",
    icon: Code,
    href: "/dashboard/integration",
    color: "text-indigo-500",
  },
  {
    label: "Conversations",
    icon: History,
    href: "/dashboard/conversations",
    color: "text-orange-500",
  },
  {
    label: "Analytics",
    icon: LineChart,
    href: "/dashboard/analytics",
    color: "text-green-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="relative min-h-screen">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <div className="flex flex-col h-full">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2 flex-1">
              <div className="flex items-center pl-3 mb-14">
                <Logo size="lg" />
              </div>
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                      "text-zinc-400"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <DashboardNav user={session?.user} />
        </div>
      </div>
      <main className="md:pl-72">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
} 