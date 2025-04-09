
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, BarChart3, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];

const FarmerReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [yearFilter, setYearFilter] = useState("2025");
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [productDistribution, setProductDistribution] = useState([]);
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    auctionSuccess: 0,
    averageOrderValue: 0
  });
  
  // Fetch reports data on component mount
  useEffect(() => {
    if (profile?.id) {
      fetchReportsData();
    }
  }, [profile?.id, yearFilter]);
  
  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Fetch monthly sales data
      const { data: salesData, error: salesError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', profile.id)
        .eq('metric_type', 'sales')
        .eq('period', yearFilter);
      
      if (salesError) throw salesError;
      
      // Transform data for the chart
      const monthlySales = salesData?.length > 0 ? 
        transformMonthlyData(salesData) : 
        generateDefaultMonthlySales();
      
      setSalesData(monthlySales);
      
      // Fetch product distribution data
      const { data: productData, error: productError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', profile.id)
        .eq('metric_type', 'product_distribution')
        .eq('period', 'all_time');
      
      if (productError) throw productError;
      
      // Transform data for the chart
      const productDist = productData?.length > 0 ? 
        transformProductData(productData) : 
        generateDefaultProductDistribution();
      
      setProductDistribution(productDist);
      
      // Fetch saved reports
      const { data: reportsList, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (reportsError) throw reportsError;
      
      setReports(reportsList || []);
      
      // Fetch key metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', profile.id)
        .in('metric_type', ['total_revenue', 'auction_success', 'avg_order_value'])
        .eq('period', yearFilter);
      
      if (metricsError) throw metricsError;
      
      // Process metrics
      processMetricsData(metricsData);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Transform monthly data for chart
  const transformMonthlyData = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a map to hold the sales data by month
    const salesByMonth = {};
    months.forEach(month => {
      salesByMonth[month] = 0;
    });
    
    // Populate with actual data
    data.forEach(item => {
      const month = new Date(item.date).getMonth();
      salesByMonth[months[month]] = item.value;
    });
    
    // Convert to array format for the chart
    return Object.keys(salesByMonth).map(month => ({
      month,
      sales: salesByMonth[month]
    }));
  };
  
  // Transform product data for chart
  const transformProductData = (data) => {
    return data.map(item => ({
      name: item.data.name,
      value: item.value
    }));
  };
  
  // Process metrics data
  const processMetricsData = (data) => {
    if (!data || data.length === 0) {
      // Use default values
      setMetrics({
        totalRevenue: 826000,
        auctionSuccess: 72.5,
        averageOrderValue: 64800
      });
      return;
    }
    
    const newMetrics = { ...metrics };
    
    data.forEach(item => {
      switch (item.metric_type) {
        case 'total_revenue':
          newMetrics.totalRevenue = item.value;
          break;
        case 'auction_success':
          newMetrics.auctionSuccess = item.value;
          break;
        case 'avg_order_value':
          newMetrics.averageOrderValue = item.value;
          break;
        default:
          break;
      }
    });
    
    setMetrics(newMetrics);
  };
  
  // Generate default data for development/testing
  const generateDefaultMonthlySales = () => {
    return [
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
  };
  
  const generateDefaultProductDistribution = () => {
    return [
      { name: 'Wheat', value: 40 },
      { name: 'Rice', value: 30 },
      { name: 'Lentils', value: 15 },
      { name: 'Spices', value: 10 },
      { name: 'Others', value: 5 },
    ];
  };
  
  // Handle downloading a report
  const handleDownloadReport = async (report) => {
    try {
      toast({
        title: "Downloading...",
        description: "Preparing your report for download."
      });
      
      // Generate report content based on report type
      let content = '';
      
      if (report.data) {
        // Format JSON data as CSV or another format based on report type
        if (report.report_type === 'Sales') {
          content = generateSalesCsv(report.data);
        } else if (report.report_type === 'Product') {
          content = generateProductCsv(report.data);
        } else if (report.report_type === 'Auction') {
          content = generateAuctionCsv(report.data);
        } else if (report.report_type === 'Finance') {
          content = generateFinanceCsv(report.data);
        } else {
          // Generic format
          content = 'Report Type: ' + report.report_type + '\n\n';
          content += 'Period: ' + report.period + '\n\n';
          content += 'Data:\n' + JSON.stringify(report.data, null, 2);
        }
      } else {
        content = 'No data available for this report.';
      }
      
      // Create a download link
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${report.report_type}_Report_${report.period}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Generate CSV content for different report types
  const generateSalesCsv = (data) => {
    let csv = 'Date,Product,Quantity,Price,Total\n';
    
    if (Array.isArray(data.sales)) {
      data.sales.forEach(sale => {
        csv += `${sale.date},${sale.product},${sale.quantity},${sale.price},${sale.total}\n`;
      });
    }
    
    return csv;
  };
  
  const generateProductCsv = (data) => {
    let csv = 'Product,Category,Total Sales,Average Price,Quantity Sold\n';
    
    if (Array.isArray(data.products)) {
      data.products.forEach(product => {
        csv += `${product.name},${product.category},${product.sales},${product.avgPrice},${product.quantity}\n`;
      });
    }
    
    return csv;
  };
  
  const generateAuctionCsv = (data) => {
    let csv = 'Auction ID,Product,Start Price,Final Price,Bids,Status,Date\n';
    
    if (Array.isArray(data.auctions)) {
      data.auctions.forEach(auction => {
        csv += `${auction.id},${auction.product},${auction.startPrice},${auction.finalPrice},${auction.bids},${auction.status},${auction.date}\n`;
      });
    }
    
    return csv;
  };
  
  const generateFinanceCsv = (data) => {
    let csv = 'Month,Revenue,Expenses,Profit\n';
    
    if (Array.isArray(data.finances)) {
      data.finances.forEach(finance => {
        csv += `${finance.month},${finance.revenue},${finance.expenses},${finance.profit}\n`;
      });
    }
    
    return csv;
  };
  
  // Generate a new report
  const generateNewReport = async (type) => {
    try {
      setLoading(true);
      toast({
        title: "Generating Report",
        description: "Please wait while we generate your report..."
      });
      
      // Get current date for report name
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'dd MMM yyyy');
      
      // Generate report data based on type
      let reportData = {};
      let reportTitle = '';
      let reportType = '';
      
      switch (type) {
        case 'sales':
          reportData = await generateSalesReportData();
          reportTitle = `Monthly Sales Report - ${format(currentDate, 'MMMM yyyy')}`;
          reportType = 'Sales';
          break;
        case 'product':
          reportData = await generateProductReportData();
          reportTitle = `Quarterly Product Performance Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${currentDate.getFullYear()}`;
          reportType = 'Product';
          break;
        case 'auction':
          reportData = await generateAuctionReportData();
          reportTitle = `Auction Success Rate Analysis`;
          reportType = 'Auction';
          break;
        case 'finance':
          reportData = await generateFinanceReportData();
          reportTitle = `Annual Profit Projection ${currentDate.getFullYear()}`;
          reportType = 'Finance';
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      // Save report to database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: profile.id,
          report_type: reportType,
          period: yearFilter,
          data: reportData,
          title: reportTitle,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      // Refresh reports list
      fetchReportsData();
      
      toast({
        title: "Success",
        description: "Report generated successfully!",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate data for different report types
  const generateSalesReportData = async () => {
    // Fetch orders data
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        product_id,
        quantity,
        price,
        total_amount,
        created_at,
        status,
        products (
          name,
          category
        )
      `)
      .eq('farmer_id', profile.id)
      .gte('created_at', `${yearFilter}-01-01`)
      .lte('created_at', `${yearFilter}-12-31`);
    
    if (error) throw error;
    
    // Transform data for report
    const sales = data.map(order => ({
      date: format(new Date(order.created_at), 'yyyy-MM-dd'),
      product: order.products?.name || 'Unknown Product',
      quantity: order.quantity,
      price: order.price,
      total: order.total_amount
    }));
    
    return { sales };
  };
  
  const generateProductReportData = async () => {
    // Fetch products data with sales info
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category,
        price,
        quantity,
        orders (
          quantity,
          price,
          total_amount
        )
      `)
      .eq('farmer_id', profile.id);
    
    if (error) throw error;
    
    // Transform data for report
    const products = data.map(product => {
      // Calculate sales metrics
      const totalSales = product.orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const quantitySold = product.orders?.reduce((sum, order) => sum + order.quantity, 0) || 0;
      const avgPrice = quantitySold > 0 ? totalSales / quantitySold : product.price;
      
      return {
        name: product.name,
        category: product.category,
        sales: totalSales,
        avgPrice: avgPrice,
        quantity: quantitySold
      };
    });
    
    return { products };
  };
  
  const generateAuctionReportData = async () => {
    // Fetch auctions data
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        id,
        product_id,
        start_price,
        current_price,
        status,
        start_time,
        end_time,
        products (
          name
        ),
        bids (
          id,
          amount
        )
      `)
      .eq('farmer_id', profile.id);
    
    if (error) throw error;
    
    // Transform data for report
    const auctions = data.map(auction => ({
      id: auction.id,
      product: auction.products?.name || 'Unknown Product',
      startPrice: auction.start_price,
      finalPrice: auction.current_price,
      bids: auction.bids?.length || 0,
      status: auction.status,
      date: format(new Date(auction.start_time), 'yyyy-MM-dd')
    }));
    
    return { auctions };
  };
  
  const generateFinanceReportData = async () => {
    // Fetch orders data for revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('farmer_id', profile.id)
      .eq('status', 'completed')
      .gte('created_at', `${yearFilter}-01-01`)
      .lte('created_at', `${yearFilter}-12-31`);
    
    if (ordersError) throw ordersError;
    
    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const finances = months.map((month, index) => {
      // Filter orders for current month
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === index;
      });
      
      // Calculate revenue
      const revenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      // Simulate expenses (just for demo purposes)
      const expenses = revenue * 0.6;
      
      return {
        month,
        revenue,
        expenses,
        profit: revenue - expenses
      };
    });
    
    return { finances };
  };
  
  if (loading) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="Reports & Analytics" userName={profile?.name || "Farmer"} />
        
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Reports & Analytics" userName={profile?.name || "Farmer"} />
      
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
                      data={salesData}
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
                      <p className="text-3xl font-bold mt-2">₹{metrics.totalRevenue.toLocaleString()}</p>
                      <span className="text-sm text-green-600 mt-1">↑ 12.3% vs last year</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Auction Success</h3>
                      <p className="text-3xl font-bold mt-2">{metrics.auctionSuccess}%</p>
                      <span className="text-sm text-green-600 mt-1">↑ 5.2% vs last quarter</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium text-muted-foreground">Average Order Value</h3>
                      <p className="text-3xl font-bold mt-2">₹{metrics.averageOrderValue.toLocaleString()}</p>
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
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>Access your previously generated reports</CardDescription>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => generateNewReport('sales')}>
                    Sales Report
                  </Button>
                  <Button variant="outline" onClick={() => generateNewReport('product')}>
                    Product Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Report Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Generated On</th>
                      <th className="text-right py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                              <span>{report.title || `${report.report_type} Report - ${report.period}`}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{report.report_type}</td>
                          <td className="py-3 px-4">{format(new Date(report.created_at), 'dd MMM yyyy')}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(report)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No reports found. Generate a report to see it here.
                        </td>
                      </tr>
                    )}
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
