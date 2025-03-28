"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Trash2, Bot, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Schéma de validation pour les données du chatbot
const chatbotSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().nullable().optional(),
  systemPrompt: z.string().min(5, "Le prompt système doit contenir au moins 5 caractères"),
  temperature: z.number().min(0).max(1),
  avatar: z.string().nullable().optional(),
});

export default function ChatbotSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "You are a helpful assistant that answers questions based on the provided context.",
    temperature: 0.7,
    avatar: "",
  });
  
  // Fonction pour nettoyer les données
  const sanitizeFormData = (data: any) => {
    return {
      name: data.name?.trim() || "",
      description: data.description?.trim() || null,
      systemPrompt: data.systemPrompt?.trim() || "You are a helpful assistant that answers questions based on the provided context.",
      temperature: parseFloat(data.temperature.toString()) || 0.7,
      avatar: data.avatar?.trim() || null,
    };
  };

  useEffect(() => {
    async function fetchChatbot() {
      try {
        setLoading(true);
        const response = await fetch(`/api/chatbots/${chatbotId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch chatbot");
        }
        
        const data = await response.json();
        setFormData({
          name: data.name || "",
          description: data.description || "",
          systemPrompt: data.systemPrompt || "You are a helpful assistant that answers questions based on the provided context.",
          temperature: data.temperature || 0.7,
          avatar: data.avatar || "",
        });
      } catch (error) {
        console.error("Error fetching chatbot:", error);
        setError("Failed to load chatbot settings");
        toast.error("Error loading chatbot settings");
      } finally {
        setLoading(false);
      }
    }
    
    fetchChatbot();
  }, [chatbotId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "temperature") {
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0.7 : Math.max(0, Math.min(1, numValue)),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Valider et nettoyer les données avant envoi
      const cleanData = sanitizeFormData(formData);
      
      // Vérifier que les données sont valides avec Zod
      const validationResult = chatbotSchema.safeParse(cleanData);
      
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message);
      }
      
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update chatbot");
      }
      
      toast.success("Chatbot updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating chatbot:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update chatbot");
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete chatbot");
      }
      
      toast.success("Chatbot deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete chatbot");
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6 flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive/70" />
        <h2 className="text-xl font-semibold">Failed to Load Settings</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{formData.name} Settings</h1>
          <p className="text-muted-foreground">Manage your chatbot settings and configuration</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/dashboard/chat/${chatbotId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Configuration</CardTitle>
            <CardDescription>
              Customize your chatbot's personality and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My AI Assistant"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A helpful AI assistant that..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleChange}
                placeholder="You are a helpful assistant that..."
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground">
                This prompt guides the AI's behavior and sets its personality and knowledge domain.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature ({formData.temperature.toFixed(1)})</Label>
                <span className="text-xs text-muted-foreground font-mono">{formData.temperature.toFixed(1)}</span>
              </div>
              <Input
                id="temperature"
                name="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More focused (0.0)</span>
                <span>More creative (1.0)</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete Chatbot"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your chatbot
                    and all associated conversations and documents.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {deleting ? "Deleting..." : "Yes, delete chatbot"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 