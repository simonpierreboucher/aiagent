"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, File, Globe, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Document {
  id: string;
  filename: string;
  sourceType: string;
  uploadedAt: string;
  _count?: {
    chunks: number;
  };
}

interface DocumentListProps {
  chatbotId: string;
  onDocumentDeleted?: () => void;
}

export function DocumentList({ chatbotId, onDocumentDeleted }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents?chatbotId=${chatbotId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Error loading documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [chatbotId]);

  const handleDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${documentToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      toast.success("Document deleted successfully");
      setDocumentToDelete(null);
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error deleting document");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "url":
        return <Globe className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="h-12 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium">No documents yet</h3>
        <p className="mb-4 text-sm text-gray-500">
          Upload documents or add URLs to train your chatbot.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Documents ({documents.length})</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  {renderSourceIcon(doc.sourceType)}
                  <span className="ml-2 truncate">{doc.filename}</span>
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDocumentToDelete(doc.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Document</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this document? This will remove all chunks and
                        associated vector embeddings.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDocumentToDelete(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                {doc.sourceType.toUpperCase()} • Uploaded on {formatDate(doc.uploadedAt)}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <div className="text-sm text-gray-500">
                {doc._count?.chunks || 0} chunks processed
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 