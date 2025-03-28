"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Send, ArrowLeft, MessageSquare, Github, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/app/footer";

export default function ChatbotPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const [chatbot, setChatbot] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingChatbot, setIsLoadingChatbot] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // Fetch chatbot info
  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        setIsLoadingChatbot(true);
        // Dans une vraie application, remplacer cette simulation par un appel API réel
        // const response = await fetch(`/api/chatbots/${chatbotId}`);
        // const data = await response.json();
        
        // Simulation d'un appel API pour la démonstration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockChatbot = {
          id: chatbotId,
          name: "Assistant ChatSPB",
          description: "Un assistant IA intelligent et personnalisable",
          avatar: null,
          temperature: 0.7,
          systemPrompt: "Vous êtes un assistant IA utile, concis et précis.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user123"
        };
        
        setChatbot(mockChatbot);
        
        // Ajouter un message d'accueil du bot
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
          timestamp: new Date().toISOString(),
        }]);
      } catch (err) {
        console.error("Erreur lors de la récupération du chatbot:", err);
        setError("Impossible de charger ce chatbot. Il n'existe peut-être pas ou vous n'avez pas l'autorisation d'y accéder.");
      } finally {
        setIsLoadingChatbot(false);
      }
    };

    fetchChatbot();
  }, [chatbotId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowThinking(true);
    
    // Attendre un peu avant d'afficher l'animation de réflexion (pour un effet naturel)
    setTimeout(() => {
      setIsTyping(true);
    }, 1000);
    
    try {
      // Dans une vraie application, envoyer la requête à l'API
      // const response = await fetch(`/api/chatbots/${chatbotId}/query`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ 
      //     query: input, 
      //     sessionId: "session-" + Math.random().toString(36).substring(2, 9)
      //   }),
      // });
      // const data = await response.json();
      
      // Simulation d'une réponse pour la démonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const botResponse = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Voici ma réponse à votre question "${input}". En tant qu'assistant IA, je suis là pour vous aider avec diverses tâches et pour répondre à vos questions le plus précisément possible.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      toast.error("Une erreur est survenue lors de l'envoi de votre message.");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setShowThinking(false);
    }
  };

  if (isLoadingChatbot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500 opacity-75 blur"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background">
            <div className="animate-pulse">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>
        <h3 className="mt-8 text-xl font-semibold tracking-tight">Chargement de votre assistant...</h3>
        <p className="mt-2 text-muted-foreground">Préparation de l'environnement intelligent...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-75 blur"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-background">
            <Sparkles className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Chatbot introuvable</h1>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button asChild className="animate-pulse bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-primary/10">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <Logo size="sm" />
            </Link>
            <span className="text-muted-foreground mx-2">|</span>
            <div className="flex items-center gap-2">
              {chatbot?.avatar ? (
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={chatbot.avatar} alt={chatbot.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-primary/20">{chatbot.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/30 flex items-center justify-center shadow-lg">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              )}
              <div>
                <h1 className="font-medium text-sm">{chatbot?.name}</h1>
                <p className="text-xs text-primary/70">IA Intelligente</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Chat Area */}
      <main className="flex-1 overflow-auto py-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in-0 slide-in-from-${message.role === "user" ? "right" : "left"}-5 duration-300`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/30 flex-shrink-0 flex items-center justify-center mt-1 shadow-lg">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-xl max-w-[80%] shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-purple-500 text-primary-foreground rounded-tr-none"
                      : "bg-gradient-to-br from-card to-muted/80 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex-shrink-0 flex items-center justify-center mt-1 shadow-lg">
                    <MessageSquare className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {showThinking && (
              <div className="flex justify-start gap-3 animate-in fade-in-0 slide-in-from-left-5 duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/30 flex-shrink-0 flex items-center justify-center mt-1 shadow-lg">
                  {isTyping ? (
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  ) : (
                    <Brain className="h-4 w-4 text-primary animate-pulse" />
                  )}
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-card to-muted/80 rounded-tl-none shadow-md flex items-center space-x-2">
                  {isTyping ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Réflexion en cours...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Input Area */}
      <footer className="sticky bottom-0 backdrop-blur-xl bg-background/80 border-t border-primary/10 p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Écrivez votre message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="bg-muted/30 border-primary/20 focus-visible:ring-primary pr-10 transition-all hover:bg-muted/50"
              />
              {input.length > 0 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={`transition-all bg-gradient-to-r ${isLoading ? 'from-primary/70 to-purple-500/70' : 'from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Envoyer</span>
            </Button>
          </form>
          <div className="mt-2 flex justify-center">
            <p className="text-xs text-muted-foreground">
              Propulsé par <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">M-LAI</span> &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 