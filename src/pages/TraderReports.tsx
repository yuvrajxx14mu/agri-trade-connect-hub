
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Download, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

// Fake data for demo purposes
const getPurchaseData = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `purchase-${i + 1}`,
    date: new Date(Date.now() - (i * 86400000)).toISOString(),
    product_category: ['Grains', 'Vegetables', 'Fruits', 'Dairy', 'Spices'][Math.floor(Math.random() * 5)],
    total_amount: Math.floor(Math.random() * 10000) + 500
  }));
};

const getMarketPriceData = (count = 100) => {
  const startDate = new Date(2023, 0, 1);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    return {
      date: date.toISOString().split('T')[0],
      wheat_price: Math.floor(Math.random() * 300) + 1500,
      rice_price: Math.floor(Math.random() * 200) + 2000,
      lentils_price: Math.floor(Math.random() * 150) + 1000,
      potatoes_price: Math.floor(Math.random() * 100) + 500
    };
  });
};

const TraderReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("purchases");
  const [timeframe, setTimeframe] = useState("7days");
  const [purchaseData, setPurchaseData] = useState([]);
  const [marketPriceData, setMarketPriceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      try {
        setLoading(true);
        
        // For a real implementation, these would be actual API calls
        // Since we don't have the tables yet, using sample data
        setPurchaseData(getPurchaseData(20));
        setMarketPriceData(getMarketPriceData());
        
        // Process category data
        const purchaseSample = getPurchaseData(30);
        const categoryMap = new Map();
        
        purchaseSample.forEach(purchase => {
          const category = purchase.product_category;
          const amount = purchase.total_amount;
          
          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + amount);
          } else {
            categoryMap.set(category, amount);
          }
        });
        
        const processedCategoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: value as number
        }));
        
        setCategoryData(processedCategoryData);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [profile?.id, timeframe, toast]);
  
  const handleDownloadReport = (reportType) => {
    // In a real app, this would generate and download a PDF or CSV
    toast({
      title: "Report Downloaded",
      description: `${reportType} report has been downloaded.`,
      variant: "default"
    });
  };
  
  const filterDataByTimeframe = (data) => {
    const now = new Date();
    const msInDay = 86400000;
    
    switch (timeframe) {
      case "7days":
        return data.filter(item => {
          const date = new Date(item.date);
          return (now.getTime() - date.getTime()) <= (7 * msInDay);
        });
      case "30days":
        return data.filter(item => {
          const date = new Date(item.date);
          return (now.getTime() - date.getTime()) <= (30 * msInDay);
        });
      case "90days":
        return data.filter(item => {
          const date = new Date(item.date);
          return (now.getTime() - date.getTime()) <= (90 * msInDay);
        });
      case "year":
        return data.filter(item => {
          const date = new Date(item.date);
          return date.getFullYear() === now.getFullYear();
        });
      default:
        return data;
    }
  };
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Analytics & Reports" userName={profile?.name || "Trader"} />
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle>Reports Dashboard</CardTitle>
              <CardDescription>View and analyze your trading activities</CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="market-prices">Market Prices</TabsTrigger>
                <TabsTrigger value="categories">Product Categories</TabsTrigger>
                <TabsTrigger value="custom">Custom Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="purchases" className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => handleDownloadReport("Purchases")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filterDataByTimeframe(purchaseData)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`₹${value}`, "Amount"]}
                          labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                        />
                        <Legend />
                        <Bar dataKey="total_amount" name="Purchase Amount (₹)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="market-prices" className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => handleDownloadReport("Market Prices")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={filterDataByTimeframe(marketPriceData)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`₹${value}`, "Price"]}
                          labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="wheat_price" name="Wheat (₹/Quintal)" stroke="#8884d8" />
                        <Line type="monotone" dataKey="rice_price" name="Rice (₹/Quintal)" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="lentils_price" name="Lentils (₹/Quintal)" stroke="#ffc658" />
                        <Line type="monotone" dataKey="potatoes_price" name="Potatoes (₹/Quintal)" stroke="#ff8042" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => handleDownloadReport("Categories")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, "Total Spend"]} />
                        <Legend />
                        <Bar dataKey="value" name="Amount Spent (₹)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Custom Reports</AlertTitle>
                  <AlertDescription>
                    You can create and download custom reports based on your specific requirements.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Profit Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Detailed breakdown of purchases, sales, and profit margins by month.</p>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button className="w-full" variant="outline" onClick={() => handleDownloadReport("Monthly Profit")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Farmer Relationship Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Summary of transactions by farmer, including purchase history and product details.</p>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button className="w-full" variant="outline" onClick={() => handleDownloadReport("Farmer Relationship")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seasonal Trends Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Analysis of market trends and price fluctuations across different seasons.</p>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button className="w-full" variant="outline" onClick={() => handleDownloadReport("Seasonal Trends")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Product Performance Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Detailed analysis of each product's performance, demand, and price history.</p>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button className="w-full" variant="outline" onClick={() => handleDownloadReport("Product Performance")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderReports;
