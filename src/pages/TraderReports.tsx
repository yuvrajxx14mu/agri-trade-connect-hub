
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

// Sample data for purchase history
const purchaseHistory = [
  { month: 'Jan', amount: 125000 },
  { month: 'Feb', amount: 145000 },
  { month: 'Mar', amount: 135000 },
  { month: 'Apr', amount: 178000 },
  { month: 'May', amount: 165000 },
  { month: 'Jun', amount: 190000 },
  { month: 'Jul', amount: 210000 },
  { month: 'Aug', amount: 195000 },
  { month: 'Sep', amount: 220000 },
  { month: 'Oct', amount: 250000 },
  { month: 'Nov', amount: 235000 },
  { month: 'Dec', amount: 245000 },
];

// Sample data for price trends
const priceTrends = [
  { week: 'Week 1', wheat: 2200, rice: 3500, lentils: 9000, potatoes: 1800 },
  { week: 'Week 2', wheat: 2250, rice: 3550, lentils: 9100, potatoes: 1750 },
  { week: 'Week 3', wheat: 2300, rice: 3500, lentils: 9200, potatoes: 1700 },
  { week: 'Week 4', wheat: 2280, rice: 3600, lentils: 9150, potatoes: 1820 },
  { week: 'Week 5', wheat: 2350, rice: 3650, lentils: 9050, potatoes: 1900 },
  { week: 'Week 6', wheat: 2400, rice: 3700, lentils: 9000, potatoes: 1950 },
  { week: 'Week 7', wheat: 2380, rice: 3750, lentils: 9100, potatoes: 1920 },
  { week: 'Week 8', wheat: 2420, rice: 3800, lentils: 9150, potatoes: 1880 },
];

// Sample data for purchase distribution
const purchaseDistribution = [
  { name: 'Cereals', value: 45 },
  { name: 'Pulses', value: 20 },
  { name: 'Vegetables', value: 15 },
  { name: 'Spices', value: 10 },
  { name: 'Fruits', value: 10 },
];

const COLORS = ['#2563EB', '#4F46E5', '#7C3AED', '#C026D3', '#DB2777'];

// Sample reports list
const reports = [
  {
    id: 'REP001',
    title: 'Monthly Purchase Report - March 2025',
    type: 'Purchase',
    date: '01 Apr 2025',
    fileSize: '1.5 MB'
  },
  {
    id: 'REP002',
    title: 'Quarterly Auction Participation Q1 2025',
    type: 'Auction',
    date: '05 Apr 2025',
    fileSize: '2.1 MB'
  },
  {
    id: 'REP003',
    title: 'Product Price Analysis',
    type: 'Price',
    date: '15 Mar 2025',
    fileSize: '0.9 MB'
  },
  {
    id: 'REP004',
    title: 'Annual Procurement Strategy 2025',
    type: 'Strategy',
    date: '20 Feb 2025',
    fileSize: '2.3 MB'
  }
];

const TraderReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [yearFilter, setYearFilter] = useState("2025");
  
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
