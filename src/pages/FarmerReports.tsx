
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, BarChart3, PieChart as PieChartIcon } from "lucide-react";

// Sample data for sales report
const monthlySales = [
  { month: 'Jan', sales: 42000 },
  { month: 'Feb', sales: 52000 },
  { month: 'Mar', sales: 59000 },
  { month: 'Apr', sales: 67000 },
  { month: 'May', sales: 55000 },
  { month: 'Jun', sales: 73000 },
  { month: 'Jul', sales: 86000 },
  { month: 'Aug', sales: 65000 },
  { month: 'Sep', sales: 73000 },
  { month: 'Oct', sales: 82000 },
  { month: 'Nov', sales: 91000 },
  { month: 'Dec', sales: 81000 },
];

// Sample data for product distribution
const productDistribution = [
  { name: 'Wheat', value: 40 },
  { name: 'Rice', value: 30 },
  { name: 'Lentils', value: 15 },
  { name: 'Spices', value: 10 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];

// Sample reports list
const reports = [
  {
    id: 'REP001',
    title: 'Monthly Sales Report - March 2025',
    type: 'Sales',
    date: '01 Apr 2025',
    fileSize: '1.2 MB'
  },
  {
    id: 'REP002',
    title: 'Quarterly Product Performance Q1 2025',
    type: 'Product',
    date: '05 Apr 2025',
    fileSize: '2.4 MB'
  },
  {
    id: 'REP003',
    title: 'Auction Success Rate Analysis',
    type: 'Auction',
    date: '15 Mar 2025',
    fileSize: '0.8 MB'
  },
  {
    id: 'REP004',
    title: 'Annual Profit Projection 2025',
    type: 'Finance',
    date: '20 Feb 2025',
    fileSize: '1.5 MB'
  }
];

const FarmerReports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [yearFilter, setYearFilter] = useState("2025");
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Reports & Analytics" userName="Rajesh Kumar" />
      
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
                    Monthly Sales
                  </CardTitle>
                  <CardDescription>Your sales performance over time</CardDescription>
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
                      data={monthlySales}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Sales']}
                        labelFormatter={(label) => `${label} ${yearFilter}`}
                      />
                      <Legend />
                      <Bar dataKey="sales" name="Sales (₹)" fill="#2D6A4F" />
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
                    Product Distribution
                  </CardTitle>
                  <CardDescription>Sales distribution by product category</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productDistribution.map((entry, index) => (
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
          
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
              <CardDescription>Summary of your business performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Total Revenue</h3>
                      <p className="text-3xl font-bold mt-2">₹8,26,000</p>
                      <span className="text-sm text-green-600 mt-1">↑ 12.3% vs last year</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Auction Success</h3>
                      <p className="text-3xl font-bold mt-2">72.5%</p>
                      <span className="text-sm text-green-600 mt-1">↑ 5.2% vs last quarter</span>
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

export default FarmerReports;
