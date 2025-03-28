"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateChatbotPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "You are a helpful assistant that answers questions based on the provided context.",
    temperature: 0.7,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      temperature: parseFloat(e.target.value),
    });
  };

  // Fonction pour nettoyer les données du formulaire avant envoi
  const sanitizeFormData = (data: any) => {
    return {
      name: data.name.trim(), // Supprimer les espaces en début et fin
      description: data.description?.trim() || null,
      systemPrompt: data.systemPrompt?.trim() || "You are a helpful assistant that answers questions based on the provided context.",
      temperature: Number(data.temperature) || 0.7,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Nettoyer et valider les données avant envoi
      const cleanData = sanitizeFormData(formData);
      
      // Vérification supplémentaire
      if (!cleanData.name) {
        throw new Error("Name is required");
      }
      
      const response = await fetch("/api/chatbots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create chatbot");
      }

      const chatbot = await response.json();
      
      toast.success("Chatbot created successfully!");
      router.push(`/dashboard/chat/${chatbot.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Chatbot</h1>
        <p className="text-gray-500">
          Configure your AI assistant to analyze your documents and answer questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="My Legal Assistant"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A helpful AI assistant that answers questions about legal documents..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              name="systemPrompt"
              placeholder="You are a helpful assistant that..."
              value={formData.systemPrompt}
              onChange={handleChange}
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500">
              This prompt guides the behavior and style of your AI assistant.
            </p>
          </div>

          <div>
            <Label htmlFor="temperature">Temperature: {formData.temperature}</Label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">0.1</span>
              <Input
                id="temperature"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleTemperatureChange}
                className="flex-1"
              />
              <span className="text-xs text-gray-500">1.0</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Lower values make responses more focused and deterministic. Higher values make output more
              creative and varied.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Chatbot"}
          </Button>
        </div>
      </form>
    </div>
  );
} 