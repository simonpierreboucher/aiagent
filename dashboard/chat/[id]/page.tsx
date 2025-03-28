"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { KnowledgeManager } from "@/components/knowledge/knowledge-manager";
import { Button } from "@/components/ui/button";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  
  const [chatbot, setChatbot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showKnowledge, setShowKnowledge] = useState(false);

  const fetchChatbot = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chatbot");
      }
      const data = await response.json();
      setChatbot(data);
    } catch (error) {
      console.error("Error fetching chatbot:", error);
      toast.error("Error loading chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbot();
  }, [chatbotId]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
        <Bot className="mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-2 text-2xl font-bold">Chatbot Not Found</h1>
        <p className="mb-6 text-gray-500">
          The chatbot you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button asChild>
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{chatbot.name}</h1>
          <p className="text-gray-500">
            {chatbot.description || "No description provided."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowKnowledge(!showKnowledge)}
          className="ml-4"
        >
          {showKnowledge ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> Hide Knowledge Base
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> Manage Knowledge
            </>
          )}
        </Button>
      </div>

      {showKnowledge && (
        <div className="mb-8 rounded-lg border p-4">
          <KnowledgeManager chatbotId={chatbotId} />
        </div>
      )}

      <div className="h-[calc(100%-2rem)]">
        <ChatInterface
          chatbotId={chatbotId}
          chatbotName={chatbot.name}
          chatbotAvatar={chatbot.avatar}
        />
      </div>
    </div>
  );
} 