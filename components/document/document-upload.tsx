"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, X, Upload, Link as LinkIcon, Settings, FileType, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentUploadProps {
  chatbotId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ chatbotId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Chunking configuration
  const [chunkSize, setChunkSize] = useState(1000);
  const [overlapSize, setOverlapSize] = useState(100);
  const [deepPdfExtraction, setDeepPdfExtraction] = useState(true);
  const [recursiveCrawling, setRecursiveCrawling] = useState(true);
  const [maxCrawlDepth, setMaxCrawlDepth] = useState(2);
  const [crawlPageLimit, setCrawlPageLimit] = useState(10);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out unsupported files
    const supportedFiles = acceptedFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'docx', 'txt', 'md'].includes(ext || '');
    });
    
    if (supportedFiles.length !== acceptedFiles.length) {
      toast.error("Some files were rejected. Supported formats: PDF, DOCX, TXT, MD");
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const uploadFiles = async () => {
    if (files.length === 0 && (!url || activeTab !== "url")) {
      toast.error("Please select files or enter a URL to upload");
      return;
    }

    setUploading(true);

    try {
      if (activeTab === "file" && files.length > 0) {
        const formData = new FormData();
        formData.append("chatbotId", chatbotId);
        formData.append("chunkSize", chunkSize.toString());
        formData.append("overlapSize", overlapSize.toString());
        formData.append("deepPdfExtraction", deepPdfExtraction.toString());
        
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload files");
        }

        const data = await response.json();
        toast.success(`${files.length} document(s) uploaded successfully! Created ${data.documents.reduce(
          (acc: number, doc: any) => acc + doc.chunkCount,
          0
        )} chunks.`);
        setFiles([]);
      } else if (activeTab === "url" && url) {
        const endpoint = recursiveCrawling ? "/api/documents/url/crawl" : "/api/documents/url";
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatbotId,
            url,
            chunkSize,
            overlapSize,
            maxDepth: maxCrawlDepth,
            maxPages: crawlPageLimit
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process URL");
        }

        const data = await response.json();
        
        if (recursiveCrawling) {
          toast.success(`Crawled ${data.processedCount} pages from ${url}. Created ${data.totalChunks} chunks.`);
        } else {
          toast.success(`Processed URL successfully! Created ${data.chunkCount} chunks.`);
        }
        
        setUrl("");
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error("Error uploading:", error);
      toast.error(error.message || "Error processing documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6 space-y-4 rounded-lg border p-4 bg-gradient-to-br from-background to-primary/5">
      <div className="flex space-x-2 border-b">
        <button
          type="button"
          className={`border-b-2 px-4 py-2 ${
            activeTab === "file" ? "border-primary font-medium" : "border-transparent"
          }`}
          onClick={() => setActiveTab("file")}
        >
          Upload Files
        </button>
        <button
          type="button"
          className={`border-b-2 px-4 py-2 ${
            activeTab === "url" ? "border-primary font-medium" : "border-transparent"
          }`}
          onClick={() => setActiveTab("url")}
        >
          Add URL
        </button>
      </div>

      {activeTab === "file" ? (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mb-2 h-8 w-8 text-primary/60" />
            <p className="mb-1 text-sm font-medium">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOCX, TXT, MD
            </p>
          </div>

          {files.length > 0 && (
            <div className="rounded-md border">
              <div className="px-4 py-2 bg-muted/50 border-b">
                <h3 className="font-medium text-sm">Selected Files ({files.length})</h3>
              </div>
              <ul className="max-h-48 overflow-auto divide-y">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center">
                      <FileType className="h-5 w-5 text-primary/70 mr-2" />
                      <div>
                        <p className="font-medium text-sm truncate max-w-[300px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-destructive/70 hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Enter Website URL
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/page"
                  className="pl-10"
                  value={url}
                  onChange={handleUrlChange}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              We'll extract the content from this URL and add it to your chatbot's knowledge base.
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <Switch
                id="crawl-mode"
                checked={recursiveCrawling}
                onCheckedChange={setRecursiveCrawling}
              />
              <label htmlFor="crawl-mode" className="text-sm font-medium cursor-pointer">
                Crawl website (follow links)
              </label>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">This will follow links on the page and crawl multiple pages. Be careful with large websites.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {recursiveCrawling && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md mt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="crawl-depth" className="text-xs">
                      Max Crawl Depth
                    </label>
                    <span className="text-xs text-muted-foreground font-mono">{maxCrawlDepth}</span>
                  </div>
                  <Slider
                    id="crawl-depth"
                    min={1}
                    max={5}
                    step={1}
                    value={[maxCrawlDepth]}
                    onValueChange={(value) => setMaxCrawlDepth(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="page-limit" className="text-xs">
                      Max Pages
                    </label>
                    <span className="text-xs text-muted-foreground font-mono">{crawlPageLimit}</span>
                  </div>
                  <Slider
                    id="page-limit"
                    min={1}
                    max={50}
                    step={1}
                    value={[crawlPageLimit]}
                    onValueChange={(value) => setCrawlPageLimit(value[0])}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Collapsible
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        className="border rounded-md overflow-hidden"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2 text-primary/70" />
            <span className="text-sm font-medium">Advanced Options</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {showAdvanced ? "Hide" : "Show"}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 space-y-5 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="chunk-size" className="text-sm font-medium">
                    Chunk Size (tokens)
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">{chunkSize}</span>
                </div>
                <Slider
                  id="chunk-size"
                  min={200}
                  max={2000}
                  step={50}
                  value={[chunkSize]}
                  onValueChange={(value) => setChunkSize(value[0])}
                  className="mb-1"
                />
                <p className="text-xs text-muted-foreground">
                  Size of each text chunk. Smaller chunks improve search accuracy but increase storage and processing time.
                </p>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="overlap-size" className="text-sm font-medium">
                    Overlap Size (tokens)
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">{overlapSize}</span>
                </div>
                <Slider
                  id="overlap-size"
                  min={0}
                  max={500}
                  step={10}
                  value={[overlapSize]}
                  onValueChange={(value) => setOverlapSize(value[0])}
                  className="mb-1"
                />
                <p className="text-xs text-muted-foreground">
                  Amount of text that overlaps between adjacent chunks. Helps maintain context across chunks.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeTab === "file" && (
                <div className="flex items-start space-x-2">
                  <Switch
                    id="pdf-extraction"
                    checked={deepPdfExtraction}
                    onCheckedChange={setDeepPdfExtraction}
                  />
                  <div>
                    <label htmlFor="pdf-extraction" className="text-sm font-medium cursor-pointer">
                      Deep PDF Extraction
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Use advanced extraction techniques to maintain PDF structure, tables, and formatting. May increase processing time.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="p-3 border rounded-md bg-primary/5 mt-2">
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                  Recommendation
                </h4>
                <p className="text-xs text-muted-foreground">
                  For most documents, a chunk size of 800-1000 tokens with an overlap of 100-200 tokens works well.
                  Larger documents benefit from larger chunks.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end mt-4">
        <Button onClick={uploadFiles} disabled={uploading} className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600">
          {uploading
            ? "Processing..."
            : activeTab === "file"
            ? `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`
            : recursiveCrawling 
              ? "Crawl Website" 
              : "Process URL"}
        </Button>
      </div>
    </div>
  );
} 