"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import { 
  MessageSquare, 
  FileText, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  TrendingUp,
  BrainCircuit,
  Database,
  Clock,
  BarChart2,
  PieChart as PieChartIcon
} from "lucide-react";

// Types
interface Chatbot {
  id: string;
  name: string;
  documentCount: number;
  conversationCount: number;
}

interface ChatbotStats {
  documentCount: number;
  chunkCount: number;
  conversationCount: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  topQueries: { query: string; count: number }[];
}

interface ConversationsOverTime {
  date: string;
  count: number;
}

interface SourcesDistribution {
  source: string;
  count: number;
}

// Color constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7days");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("all");
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [conversationData, setConversationData] = useState<ConversationsOverTime[]>([]);
  const [sourcesData, setSourcesData] = useState<SourcesDistribution[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [topQueries, setTopQueries] = useState<{ query: string; count: number }[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  
  // Fetch chatbots
  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await fetch("/api/chatbots");
        if (response.ok) {
          const data = await response.json();
          setChatbots(data);
          if (data.length > 0) {
            setSelectedChatbot(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching chatbots:", error);
      }
    };
    
    fetchChatbots();
  }, []);
  
  // Fetch stats and data when period or chatbot changes
  useEffect(() => {
    if (selectedChatbot) {
      fetchStats();
      generateMockData();
    }
  }, [selectedPeriod, selectedChatbot]);
  
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chatbots/${selectedChatbot}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock data for charts
  // In a real app, this would come from API endpoints
  const generateMockData = () => {
    // Conversations over time
    const days = getDaysInPeriod();
    const conversationsData = days.map(day => ({
      date: format(day, "MMM dd"),
      count: Math.floor(Math.random() * 20)
    }));
    setConversationData(conversationsData);
    
    // Sources distribution
    const sources = [
      { source: "PDF", count: Math.floor(Math.random() * 100) + 50 },
      { source: "URL", count: Math.floor(Math.random() * 100) + 30 },
      { source: "DOCX", count: Math.floor(Math.random() * 50) + 10 },
      { source: "TXT", count: Math.floor(Math.random() * 30) + 5 },
    ];
    setSourcesData(sources);
    
    // Feedback distribution
    const feedback = [
      { name: "Positive", value: Math.floor(Math.random() * 100) + 50 },
      { name: "Negative", value: Math.floor(Math.random() * 30) + 5 },
      { name: "Neutral", value: Math.floor(Math.random() * 50) + 20 },
    ];
    setFeedbackData(feedback);
    
    // Top queries
    const queries = [
      { query: "How to configure API settings?", count: Math.floor(Math.random() * 20) + 10 },
      { query: "What is the pricing model?", count: Math.floor(Math.random() * 15) + 5 },
      { query: "How to integrate with existing systems?", count: Math.floor(Math.random() * 12) + 8 },
      { query: "What security measures are in place?", count: Math.floor(Math.random() * 10) + 7 },
      { query: "How to export data?", count: Math.floor(Math.random() * 8) + 5 },
    ];
    setTopQueries(queries);
    
    // Performance data
    const performance = [
      { name: "Response Time", value: Math.random() * 2 + 0.5 },
      { name: "Relevance Score", value: Math.random() * 30 + 65 },
      { name: "User Satisfaction", value: Math.random() * 20 + 75 },
      { name: "Source Quality", value: Math.random() * 15 + 80 },
    ];
    setPerformanceData(performance);
  };
  
  // Helper function to get days in the selected period
  const getDaysInPeriod = () => {
    const today = startOfDay(new Date());
    let daysToSubtract = 7;
    
    switch (selectedPeriod) {
      case "24hours":
        daysToSubtract = 1;
        break;
      case "7days":
        daysToSubtract = 7;
        break;
      case "30days":
        daysToSubtract = 30;
        break;
      case "90days":
        daysToSubtract = 90;
        break;
      default:
        daysToSubtract = 7;
    }
    
    const startDate = subDays(today, daysToSubtract);
    return eachDayOfInterval({ start: startDate, end: today });
  };
  
  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <div className="flex space-x-4">
          <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Chatbot" />
            </SelectTrigger>
            <SelectContent>
              {/*<SelectItem value="all">All Chatbots</SelectItem>*/}
              {chatbots.map(chatbot => (
                <SelectItem key={chatbot.id} value={chatbot.id}>{chatbot.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-12 w-12 text-primary" />
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.conversationCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.documentCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats?.chunkCount || 0)} indexed chunks
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats && stats.conversationCount > 0
                    ? `${Math.round((stats.positiveFeedbackCount / stats.conversationCount) * 100)}%`
                    : "0%"}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ThumbsUp className="mr-1 h-3 w-3 text-green-500" />
                  <span>{stats?.positiveFeedbackCount || 0}</span>
                  <span className="mx-2">|</span>
                  <ThumbsDown className="mr-1 h-3 w-3 text-red-500" />
                  <span>{stats?.negativeFeedbackCount || 0}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.4s</div>
                <p className="text-xs text-muted-foreground">
                  -8% from previous period
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="usage" className="space-y-4">
            <TabsList>
              <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="content">Content Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="space-y-4">
              {/* Conversation Timeline */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Conversations Over Time</CardTitle>
                  <CardDescription>
                    Number of conversations per day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={conversationData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Feedback Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Distribution</CardTitle>
                    <CardDescription>User ratings breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={feedbackData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {feedbackData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Top Queries */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Queries</CardTitle>
                    <CardDescription>Most frequent user questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topQueries}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="query" 
                            width={150}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Response Time Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Distribution</CardTitle>
                  <CardDescription>
                    Response times across different times of day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { time: '12am', value: 1.2 },
                          { time: '3am', value: 0.8 },
                          { time: '6am', value: 0.9 },
                          { time: '9am', value: 1.5 },
                          { time: '12pm', value: 1.8 },
                          { time: '3pm', value: 2.0 },
                          { time: '6pm', value: 1.8 },
                          { time: '9pm', value: 1.5 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}s`, 'Response Time']} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              {/* Document Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Source Distribution</CardTitle>
                  <CardDescription>
                    Breakdown by source type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourcesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sourcesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Content Quality by Source */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Quality by Source</CardTitle>
                  <CardDescription>
                    Relevance score by document type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'PDF', score: 85 },
                          { name: 'URL', score: 78 },
                          { name: 'DOCX', score: 82 },
                          { name: 'TXT', score: 70 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Quality Score']} />
                        <Legend />
                        <Bar dataKey="score" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 