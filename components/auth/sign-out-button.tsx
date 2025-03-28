"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/sign-in");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSignOut}
      className="rounded-full bg-transparent border-gray-700 text-zinc-400 hover:text-white hover:bg-white/10"
    >
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Log out</span>
    </Button>
  );
} 