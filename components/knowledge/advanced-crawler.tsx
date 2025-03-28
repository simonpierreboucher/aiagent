"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Globe, Link as LinkIcon, ChevronRight, ExternalLink, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface AdvancedCrawlerProps {
  chatbotId: string;
  onCrawlComplete?: () => void;
}

interface LinkInfo {
  url: string;
  text: string;
  isExternal: boolean;
  selected?: boolean;
}

interface CrawlSettings {
  maxDepth: number;
  onlySameDomain: boolean;
  followLinks: boolean;
}

export function AdvancedCrawler({ chatbotId, onCrawlComplete }: AdvancedCrawlerProps) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [internalLinks, setInternalLinks] = useState<LinkInfo[]>([]);
  const [externalLinks, setExternalLinks] = useState<LinkInfo[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const [settings, setSettings] = useState<CrawlSettings>({
    maxDepth: 1,
    onlySameDomain: true,
    followLinks: false,
  });
  const [crawlResults, setCrawlResults] = useState<any>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const analyzeUrl = async () => {
    if (!url) {
      toast.error("Please enter a URL to analyze");
      return;
    }

    try {
      // Validate URL format
      new URL(url);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    setAnalyzing(true);
    setShowLinks(false);

    try {
      const response = await fetch("/api/documents/url/extract-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze URL");
      }

      const data = await response.json();
      
      // Add "selected" property to each link
      const internalWithSelection = data.internalLinks.map((link: LinkInfo) => ({
        ...link,
        selected: true,
      }));
      
      const externalWithSelection = data.externalLinks.map((link: LinkInfo) => ({
        ...link,
        selected: false,
      }));
      
      setInternalLinks(internalWithSelection);
      setExternalLinks(externalWithSelection);
      setShowLinks(true);
      
      toast.success(`Found ${data.totalLinks} links on the page`);
    } catch (error) {
      console.error("Error analyzing URL:", error);
      toast.error("Error analyzing URL");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectAllInternal = (selected: boolean) => {
    setInternalLinks(internalLinks.map(link => ({ ...link, selected })));
  };

  const handleSelectAllExternal = (selected: boolean) => {
    setExternalLinks(externalLinks.map(link => ({ ...link, selected })));
  };

  const toggleLinkSelection = (index: number, isExternal: boolean) => {
    if (isExternal) {
      const newLinks = [...externalLinks];
      newLinks[index] = { ...newLinks[index], selected: !newLinks[index].selected };
      setExternalLinks(newLinks);
    } else {
      const newLinks = [...internalLinks];
      newLinks[index] = { ...newLinks[index], selected: !newLinks[index].selected };
      setInternalLinks(newLinks);
    }
  };

  const startCrawling = async () => {
    const selectedInternalUrls = internalLinks
      .filter(link => link.selected)
      .map(link => link.url);
      
    const selectedExternalUrls = externalLinks
      .filter(link => link.selected)
      .map(link => link.url);
    
    const allSelectedUrls = [...selectedInternalUrls, ...selectedExternalUrls];
    
    if (allSelectedUrls.length === 0) {
      // If no URLs are selected, just process the main URL
      allSelectedUrls.push(url);
    }
    
    if (allSelectedUrls.length === 0) {
      toast.error("Please select at least one URL to crawl");
      return;
    }

    setCrawling(true);
    setCrawlResults(null);

    try {
      // Créer la requête avec le format adapté à l'API
      const requestBody = {
        urls: allSelectedUrls, // Format tableau d'URLs
        chatbotId,
        maxDepth: settings.maxDepth,
        maxPages: 50, // Limiter à 50 pages max
        chunkSize: 1000, // Valeur par défaut
        overlapSize: 100, // Valeur par défaut
        onlySameDomain: settings.onlySameDomain,
        followLinks: settings.followLinks
      };

      const response = await fetch("/api/documents/url/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to crawl URLs");
      }

      const data = await response.json();
      setCrawlResults(data);
      
      if (onCrawlComplete) {
        onCrawlComplete();
      }
      
      if (data.processedCount > 0) {
        toast.success(`Successfully processed ${data.processedCount} URLs with ${data.totalChunks} total chunks`);
      } else {
        toast.warning("No URLs were successfully processed");
      }

      if (data.failedCount > 0) {
        toast.warning(`Failed to process ${data.failedCount} URLs`);
      }
    } catch (error: any) {
      console.error("Error crawling URLs:", error);
      toast.error(error.message || "Error crawling URLs");
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Enter Website URL</Label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                className="pl-10"
                value={url}
                onChange={handleUrlChange}
                disabled={analyzing || crawling}
              />
            </div>
            <Button 
              onClick={analyzeUrl} 
              disabled={analyzing || crawling}
              variant="outline"
            >
              {analyzing ? <Spinner className="mr-2 h-4 w-4" /> : <LinkIcon className="mr-2 h-4 w-4" />}
              {analyzing ? "Analyzing..." : "Analyze Links"}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter a URL to analyze its links before crawling
          </p>
        </div>
        
        {showLinks && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Crawling Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <div className="pt-0.5">
                      <Checkbox 
                        id="followLinks" 
                        checked={settings.followLinks}
                        onCheckedChange={(checked: boolean) => 
                          setSettings({...settings, followLinks: checked})
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label 
                        htmlFor="followLinks"
                        className="font-medium"
                      >
                        Follow links (crawler)
                      </Label>
                      <p className="text-xs text-gray-500">
                        Enable to follow links on pages and crawl them as well
                      </p>
                    </div>
                  </div>
                  
                  {settings.followLinks && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="maxDepth">Maximum Crawl Depth: {settings.maxDepth}</Label>
                        </div>
                        <Slider
                          id="maxDepth"
                          min={1}
                          max={5}
                          step={1}
                          value={[settings.maxDepth]}
                          onValueChange={(value: number[]) => setSettings({...settings, maxDepth: value[0]})}
                        />
                        <p className="text-xs text-gray-500">
                          How many levels of links to follow (higher values will crawl more pages)
                        </p>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <div className="pt-0.5">
                          <Checkbox 
                            id="onlySameDomain" 
                            checked={settings.onlySameDomain}
                            onCheckedChange={(checked: boolean) => 
                              setSettings({...settings, onlySameDomain: checked})
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label 
                            htmlFor="onlySameDomain"
                            className="font-medium"
                          >
                            Only follow same domain links
                          </Label>
                          <p className="text-xs text-gray-500">
                            When enabled, only follows links on the same domain
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          
            {internalLinks.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Internal Links ({internalLinks.length})</CardTitle>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSelectAllInternal(true)}
                      >
                        Select All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSelectAllInternal(false)}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Choose which internal links to crawl
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="w-12 text-right">Open</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {internalLinks.map((link, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox 
                              checked={link.selected} 
                              onCheckedChange={() => toggleLinkSelection(index, false)}
                            />
                          </TableCell>
                          <TableCell className="font-medium truncate max-w-sm">
                            <div className="truncate" title={link.url}>
                              {link.text || new URL(link.url).pathname}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={link.url}>
                              {link.url}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            
            {externalLinks.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">External Links ({externalLinks.length})</CardTitle>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSelectAllExternal(true)}
                      >
                        Select All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSelectAllExternal(false)}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Choose which external links to crawl
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="w-12 text-right">Open</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {externalLinks.map((link, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox 
                              checked={link.selected} 
                              onCheckedChange={() => toggleLinkSelection(index, true)}
                            />
                          </TableCell>
                          <TableCell className="font-medium truncate max-w-sm">
                            <div className="truncate" title={link.url}>
                              {link.text || new URL(link.url).hostname}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={link.url}>
                              {link.url}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            
            <Button 
              onClick={startCrawling} 
              disabled={crawling}
              className="w-full"
            >
              {crawling ? <Spinner className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
              {crawling ? "Crawling..." : "Start Crawling"}
            </Button>
          </div>
        )}
        
        {crawlResults && (
          <Card>
            <CardHeader>
              <CardTitle>Crawl Results</CardTitle>
              <CardDescription>
                Processed {crawlResults.processed} URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Chunks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crawlResults.results.map((result: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium truncate max-w-sm">
                        <div className="truncate" title={result.url}>
                          {result.title || new URL(result.url).hostname}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={result.url}>
                          {result.url}
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.status === 'success' ? (
                          <Badge variant="success" className="bg-green-100 text-green-800">
                            <Check className="mr-1 h-3 w-3" /> Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.chunkCount || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 