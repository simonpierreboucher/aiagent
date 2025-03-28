"use client";

import { useState, useEffect } from "react";
import { DocumentUpload } from "@/components/document/document-upload";
import { DocumentList } from "@/components/document/document-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Database, FileText, Globe, RefreshCw, BrainCircuit } from "lucide-react";
import { AdvancedCrawler } from "@/components/knowledge/advanced-crawler";

interface KnowledgeManagerProps {
  chatbotId: string;
}

export function KnowledgeManager({ chatbotId }: KnowledgeManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchUrls, setBatchUrls] = useState("");
  const [documentCount, setDocumentCount] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setDocumentCount(data.documentCount);
        setChunkCount(data.chunkCount);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [chatbotId]);

  const handleBatchUrlProcess = async () => {
    if (!batchUrls.trim()) {
      toast.error("Please enter at least one URL");
      return;
    }

    const urls = batchUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      toast.error("No valid URLs found");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process URLs in sequence
      for (const url of urls) {
        try {
          const response = await fetch("/api/documents/url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, chatbotId }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} URLs`);
        setBatchUrls("");
        fetchStats();
      }

      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} URLs`);
      }
    } catch (error) {
      toast.error("Error processing URLs");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentsChanged = () => {
    fetchStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Knowledge Management</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>Uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{documentCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Knowledge Chunks
            </CardTitle>
            <CardDescription>Indexed text segments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chunkCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BrainCircuit className="mr-2 h-5 w-5" />
              Vector Embeddings
            </CardTitle>
            <CardDescription>OpenAI embeddings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chunkCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="files">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files">Upload Files</TabsTrigger>
          <TabsTrigger value="urls">Add URLs</TabsTrigger>
          <TabsTrigger value="crawler">Advanced Crawler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="files" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Documents</CardTitle>
              <CardDescription>
                Upload PDF, DOCX, TXT, and MD files to train your AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload 
                chatbotId={chatbotId} 
                onUploadComplete={handleDocumentsChanged} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="urls" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Web Content</CardTitle>
              <CardDescription>
                Add URLs to extract and process content from websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batch-urls">Batch URLs (one per line)</Label>
                  <div className="mt-1.5">
                    <textarea
                      id="batch-urls"
                      className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="https://example.com/page1&#10;https://example.com/page2&#10;..."
                      value={batchUrls}
                      onChange={(e) => setBatchUrls(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleBatchUrlProcess} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing URLs..." : "Process URLs"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crawler" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Web Crawler</CardTitle>
              <CardDescription>
                Analyze web pages, select links to crawl, and control crawling depth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedCrawler 
                chatbotId={chatbotId}
                onCrawlComplete={handleDocumentsChanged}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>
            Manage your uploaded documents and processed URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList 
            chatbotId={chatbotId} 
            onDocumentDeleted={handleDocumentsChanged} 
          />
        </CardContent>
      </Card>
    </div>
  );
} 