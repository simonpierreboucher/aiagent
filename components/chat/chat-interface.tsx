"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  sources?: {
    text: string;
    filename: string;
    sourceId: string;
  }[];
  rating?: number | null;
}

interface ChatInterfaceProps {
  chatbotId: string;
  chatbotName: string;
  chatbotAvatar?: string;
  initialMessages?: ChatMessage[];
}

export function ChatInterface({
  chatbotId,
  chatbotName,
  chatbotAvatar,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId,
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: data.response,
        createdAt: new Date(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Error getting response from chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (messageId: string, rating: number) => {
    try {
      await fetch(`/api/chat/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          rating,
        }),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, rating } : msg
        )
      );
    } catch (error) {
      console.error("Error rating message:", error);
      toast.error("Failed to save rating");
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border">
      <div className="flex items-center border-b bg-gray-50 p-4">
        <Avatar className="mr-2 h-8 w-8">
          <AvatarImage src={chatbotAvatar} alt={chatbotName} />
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{chatbotName}</h3>
          <p className="text-xs text-gray-500">AI Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium">Start a conversation</h3>
            <p className="max-w-md text-sm text-gray-500">
              Ask questions about the documents you've uploaded to get AI-powered insights.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === "assistant" && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={chatbotAvatar} alt={chatbotName} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-xs text-gray-500">
                      {message.role === "user" ? "You" : chatbotName}
                    </span>
                    {message.role === "user" && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-2">
                      <p className="mb-1 text-xs font-medium text-gray-500">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs text-gray-500">
                            {source.filename}: {source.text.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {message.role === "assistant" && (
                    <div className="mt-2 flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-full ${
                          message.rating === 1 ? "bg-green-100 text-green-600" : ""
                        }`}
                        onClick={() => handleRating(message.id, 1)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-full ${
                          message.rating === -1 ? "bg-red-100 text-red-600" : ""
                        }`}
                        onClick={() => handleRating(message.id, -1)}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 