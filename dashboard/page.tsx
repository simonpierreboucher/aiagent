"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { PlusCircle, MessageSquare, Bot } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await fetch("/api/chatbots");
        const data = await response.json();
        setChatbots(data);
      } catch (error) {
        console.error("Error fetching chatbots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbots();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Bot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
        ) : chatbots.length > 0 ? (
          chatbots.map((bot) => (
            <Link href={`/dashboard/chat/${bot.id}`} key={bot.id}>
              <Card className="transition-all hover:border-blue-500 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Bot className="mr-2 h-5 w-5" />
                    {bot.name}
                  </CardTitle>
                  <CardDescription>
                    Created on {new Date(bot.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {bot.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {bot._count?.conversations || 0} conversations
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Bot className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No chatbots yet</h3>
            <p className="mb-4 text-sm text-gray-500">
              Create your first AI chatbot to start analyzing your documents.
            </p>
            <Link href="/dashboard/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Bot
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 