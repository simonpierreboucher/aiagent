"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ThumbsUp, ThumbsDown, MessageSquare, Search, Calendar, Filter, Download } from "lucide-react";
import { format } from "date-fns";

interface Conversation {
  id: string;
  userMsg: string;
  botMsg: string;
  sourcesUsed: any[];
  rating?: number;
  createdAt: string;
  chatbotId: string;
  chatbot?: {
    name: string;
  }
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [chatbots, setChatbots] = useState<{id: string, name: string}[]>([]);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchConversations();
    fetchChatbots();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        setFilteredConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatbots = async () => {
    try {
      const response = await fetch("/api/chatbots");
      if (response.ok) {
        const data = await response.json();
        setChatbots(data);
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedChatbot, ratingFilter, conversations]);

  const applyFilters = () => {
    let filtered = [...conversations];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        conv => 
          conv.userMsg.toLowerCase().includes(query) || 
          conv.botMsg.toLowerCase().includes(query)
      );
    }

    // Filter by chatbot
    if (selectedChatbot !== "all") {
      filtered = filtered.filter(conv => conv.chatbotId === selectedChatbot);
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      if (ratingFilter === "positive") {
        filtered = filtered.filter(conv => conv.rating === 1);
      } else if (ratingFilter === "negative") {
        filtered = filtered.filter(conv => conv.rating === -1);
      } else if (ratingFilter === "neutral") {
        filtered = filtered.filter(conv => conv.rating === 0 || conv.rating === undefined);
      }
    }

    setFilteredConversations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const exportToCSV = () => {
    // Create CSV headers
    let csv = "ID,Date,Chatbot,User Question,AI Response,Rating\n";
    
    // Add each conversation as a row
    filteredConversations.forEach(conv => {
      // Clean the text fields to handle commas and quotes
      const userMsg = `"${conv.userMsg.replace(/"/g, '""')}"`;
      const botMsg = `"${conv.botMsg.replace(/"/g, '""')}"`;
      const chatbotName = conv.chatbot?.name || "Unknown";
      const date = format(new Date(conv.createdAt), "yyyy-MM-dd HH:mm:ss");
      const rating = conv.rating === 1 ? "Positive" : conv.rating === -1 ? "Negative" : "Neutral";
      
      csv += `${conv.id},${date},"${chatbotName}",${userMsg},${botMsg},${rating}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `conversations_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConversations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conversation History</h1>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter and search through your conversation history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
              <SelectTrigger>
                <SelectValue placeholder="Select Chatbot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chatbots</SelectItem>
                {chatbots.map(chatbot => (
                  <SelectItem key={chatbot.id} value={chatbot.id}>{chatbot.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="neutral">Neutral/Unrated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchConversations}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversations ({filteredConversations.length})</CardTitle>
          <CardDescription>
            View all your chat history across all chatbots
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-10 w-10 text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[150px]">Chatbot</TableHead>
                      <TableHead>User Question</TableHead>
                      <TableHead>AI Response</TableHead>
                      <TableHead className="w-[80px] text-center">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((conversation) => (
                      <TableRow key={conversation.id}>
                        <TableCell className="font-medium">
                          {format(new Date(conversation.createdAt), "MMM d, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(conversation.createdAt), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {conversation.chatbot?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="truncate" title={conversation.userMsg}>
                            {conversation.userMsg}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[350px]">
                          <div className="truncate" title={conversation.botMsg}>
                            {conversation.botMsg}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {conversation.rating === 1 ? (
                            <Badge className="bg-green-100 text-green-800">
                              <ThumbsUp className="h-3 w-3 mr-1" /> Positive
                            </Badge>
                          ) : conversation.rating === -1 ? (
                            <Badge className="bg-red-100 text-red-800">
                              <ThumbsDown className="h-3 w-3 mr-1" /> Negative
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Neutral
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => {
                        // Add ellipsis
                        if (index > 0 && array[index - 1] !== page - 1) {
                          return (
                            <span key={`ellipsis-${page}`} className="text-muted-foreground">...</span>
                          );
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 