import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const COLORS = ['#2563EB', '#4F46E5', '#7C3AED', '#C026D3', '#DB2777'];

const TraderReports = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [priceTrends, setPriceTrends] = useState([]);
  const [purchaseDistribution, setPurchaseDistribution] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [yearFilter, setYearFilter] = useState("2025");
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Fetch purchase history
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('created_at, total_amount')
          .eq('trader_id', profile?.id)
          .order('created_at', { ascending: true });

        if (purchaseError) throw purchaseError;

        // Transform purchase data for the chart
        const monthlyPurchases = purchaseData.reduce((acc, purchase) => {
          const date = new Date(purchase.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + purchase.total_amount;
          return acc;
        }, {});

        const purchaseHistoryData = Object.entries(monthlyPurchases).map(([month, amount]) => ({
          month,
          amount
        }));

        // Fetch price trends
        const { data: priceData, error: priceError } = await supabase
          .from('price_history')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(8);

        if (priceError) throw priceError;

        const priceTrendsData = priceData.map((price, index) => ({
          week: `Week ${index + 1}`,
          wheat: price.wheat_price,
          rice: price.rice_price,
          lentils: price.lentils_price,
          potatoes: price.potatoes_price
        }));

        // Fetch purchase distribution
        const { data: distributionData, error: distributionError } = await supabase
          .from('purchases')
          .select('product_category, total_amount')
          .eq('trader_id', profile?.id);

        if (distributionError) throw distributionError;

        const distribution = distributionData.reduce((acc, purchase) => {
          acc[purchase.product_category] = (acc[purchase.product_category] || 0) + purchase.total_amount;
          return acc;
        }, {});

        const total = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);
        const purchaseDistributionData = Object.entries(distribution).map(([name, value]) => ({
          name,
          value: Math.round((value / total) * 100)
        }));

        // Fetch reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .eq('trader_id', profile?.id)
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;

        setPurchaseHistory(purchaseHistoryData);
        setPriceTrends(priceTrendsData);
        setPurchaseDistribution(purchaseDistributionData);
        setReports(reportsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchReportData();
    }
  }, [profile?.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Reports & Analytics" userName="Vikram Sharma" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center pb-4">
                <div>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Purchase History
                  </CardTitle>
                  <CardDescription>Your purchase amounts over time</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={purchaseHistory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Purchase Amount']}
                        labelFormatter={(label) => `${label} ${yearFilter}`}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="Purchase Amount (₹)" fill="#2563EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center pb-4">
                <div>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Purchase Distribution
                  </CardTitle>
                  <CardDescription>Category-wise purchase breakdown</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={purchaseDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {purchaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center pb-4">
              <div>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Price Trends
                </CardTitle>
                <CardDescription>Weekly price trends for key products</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={priceTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}/Quintal`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="wheat" name="Wheat" stroke="#2563EB" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="rice" name="Rice" stroke="#4F46E5" />
                    <Line type="monotone" dataKey="lentils" name="Lentils" stroke="#7C3AED" />
                    <Line type="monotone" dataKey="potatoes" name="Potatoes" stroke="#C026D3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Summary of your trading performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Total Spent</h3>
                      <p className="text-3xl font-bold mt-2">₹22,45,000</p>
                      <span className="text-sm text-green-600 mt-1">↑ 8.5% vs last year</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Auction Success Rate</h3>
                      <p className="text-3xl font-bold mt-2">68.3%</p>
                      <span className="text-sm text-green-600 mt-1">↑ 4.2% vs last quarter</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Average Order Value</h3>
                      <p className="text-3xl font-bold mt-2">₹64,800</p>
                      <span className="text-sm text-green-600 mt-1">↑ 3.8% vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Access your previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Report Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Generated On</th>
                      <th className="text-left py-3 px-4">Size</th>
                      <th className="text-right py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span>{report.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{report.type}</td>
                        <td className="py-3 px-4">{report.date}</td>
                        <td className="py-3 px-4">{report.fileSize}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TraderReports;
