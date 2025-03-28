"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, MessageSquare, Search, ThumbsUp, ThumbsDown, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ChatHistory {
  id: string;
  chatbotId: string;
  chatbotName: string;
  userMsg: string;
  botMsg: string;
  createdAt: string;
  rating: number | null;
  sources?: any[];
}

export default function ChatsPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ChatHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chats/history");
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setChatHistory(chatHistory.filter(chat => chat.id !== id));
        toast.success("Conversation deleted");
        setSelectedConversation(null);
      } else {
        throw new Error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHistory = searchTerm.trim() === "" 
    ? chatHistory 
    : chatHistory.filter(chat => 
        chat.userMsg.toLowerCase().includes(searchTerm.toLowerCase()) || 
        chat.botMsg.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.chatbotName.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Group by date
  const groupedHistory = filteredHistory.reduce((groups: Record<string, ChatHistory[]>, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conversation History</h1>
        
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium">No conversations yet</h3>
          <p className="mb-4 text-sm text-gray-500">
            Start chatting with your AI assistants to build conversation history.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, chats]) => (
            <div key={date}>
              <h2 className="mb-4 text-lg font-medium">{date}</h2>
              <div className="space-y-4">
                {chats.map((chat) => (
                  <Card key={chat.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bot className="mr-2 h-5 w-5 text-blue-500" />
                          <CardTitle className="text-md">{chat.chatbotName}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Link href={`/dashboard/chat/${chat.chatbotId}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Conversation</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this conversation? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedConversation(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(chat.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-sm text-gray-800">{chat.userMsg}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-gray-800">{chat.botMsg.length > 300 ? chat.botMsg.substring(0, 300) + '...' : chat.botMsg}</p>
                          
                          {chat.sources && chat.sources.length > 0 && (
                            <div className="mt-2 border-t border-gray-200 pt-2">
                              <p className="mb-1 text-xs font-medium text-gray-500">Sources:</p>
                              <div className="space-y-1">
                                {chat.sources.slice(0, 2).map((source, index) => (
                                  <div key={index} className="text-xs text-gray-500">
                                    {source.filename}: {source.text.substring(0, 100)}...
                                  </div>
                                ))}
                                {chat.sources.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{chat.sources.length - 2} more sources
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-2 flex justify-end">
                            {chat.rating === 1 && (
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                            )}
                            {chat.rating === -1 && (
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 