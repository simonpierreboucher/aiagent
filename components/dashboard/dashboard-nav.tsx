"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getInitials } from "@/lib/utils";
import { User } from "next-auth";

interface DashboardNavProps {
  user?: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  if (!user) return null;
  
  return (
    <div className="mt-auto p-4 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            ) : (
              <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
            )}
          </Avatar>
          <div className="text-xs text-zinc-400">
            <div className="font-medium">{user.name || "User"}</div>
            <div className="text-xs opacity-70">{user.email}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <ModeToggle />
          <SignOutButton />
        </div>
      </div>
    </div>
  );
} 