import { BarChart3, Sprout, IndianRupee, ShoppingCart, ArrowUpRight, Package, Gavel } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentProducts: [],
    monthlyRevenue: [],
    productPerformance: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch total products
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('farmer_id', profile.id);

        // Fetch active auctions from the auctions table
        const { data: auctions } = await supabase
          .from('auctions')
          .select('*')
          .eq('farmer_id', profile.id)
          .eq('status', 'active');

        // Fetch total revenue from completed orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('farmer_id', profile.id)
          .eq('status', 'completed')
          .eq('payment_status', 'completed');

        // Fetch pending orders
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('farmer_id', profile.id)
          .in('status', ['pending', 'confirmed', 'processing', 'shipped']);

        // Calculate monthly revenue
        const monthlyRevenue = orders ? calculateMonthlyRevenue(orders) : [];

        // Calculate product performance
        const productPerformance = products ? calculateProductPerformance(products) : [];

        setDashboardData({
          totalProducts: products?.length || 0,
          activeAuctions: auctions?.length || 0,
          totalRevenue: orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
          pendingOrders: pendingOrders?.length || 0,
          recentProducts: products?.slice(0, 3) || [],
          monthlyRevenue,
          productPerformance
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscription for auctions
    const auctionSubscription = supabase
      .channel('auctions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auctions',
          filter: `farmer_id=eq.${profile?.id}`
        },
        async () => {
          // Refetch auction count when there's any change
          const { data: auctions } = await supabase
            .from('auctions')
            .select('*')
            .eq('farmer_id', profile?.id)
            .eq('status', 'active');
          
          setDashboardData(prev => ({
            ...prev,
            activeAuctions: auctions?.length || 0
          }));
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      auctionSubscription.unsubscribe();
    };
  }, [profile?.id]);

  // Helper function to calculate monthly revenue
  const calculateMonthlyRevenue = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = new Array(12).fill(0);

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const month = date.getMonth();
      monthlyData[month] += order.total_amount;
    });

    return months.map((name, index) => ({
      name,
      value: monthlyData[index]
    }));
  };

  // Helper function to calculate product performance
  const calculateProductPerformance = (products) => {
    return products.slice(0, 4).map(product => ({
      name: product.name,
      progress: calculateProgress(product)
    }));
  };

  // Helper function to calculate product progress
  const calculateProgress = (product) => {
    if (!product?.quantity || !product?.available_quantity) return 0;
    const soldQuantity = product.quantity - product.available_quantity;
    return Math.max(0, Math.min(100, Math.round((soldQuantity / product.quantity) * 100)));
  };

  // Calculate percentage changes (comparing with previous period)
  const productChange = { value: "12%", positive: true };
  const auctionChange = { value: "2", positive: true };
  const revenueChange = { value: "8.5%", positive: true };
  const orderChange = { value: "1", positive: false };
  
  if (isLoading) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="Farmer Dashboard" userName={profile?.name || ""} userRole="farmer" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Farmer Dashboard" userName={profile?.name || ""} userRole="farmer" />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Products" 
          value={dashboardData.totalProducts.toString()} 
          icon={Sprout}
          change={productChange}
          className="bg-gradient-to-br from-green-50 to-emerald-50 shadow hover:shadow-lg transition-all duration-200"
        />
        <StatCard 
          title="Active Auctions" 
          value={dashboardData.activeAuctions.toString()} 
          icon={Gavel}
          change={auctionChange}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow hover:shadow-lg transition-all duration-200"
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(dashboardData.totalRevenue)} 
          icon={IndianRupee}
          change={revenueChange}
          className="bg-gradient-to-br from-purple-50 to-pink-50 shadow hover:shadow-lg transition-all duration-200"
        />
        <StatCard 
          title="Pending Orders" 
          value={dashboardData.pendingOrders.toString()} 
          icon={ShoppingCart}
          change={orderChange}
          className="bg-gradient-to-br from-orange-50 to-amber-50 shadow hover:shadow-lg transition-all duration-200"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2 shadow hover:shadow-lg transition-all duration-200">
          <CardHeader className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold">Revenue Overview</CardTitle>
                <CardDescription>Track your monthly earnings and sales</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/farmer/reports')}>
                View Reports
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2D6A4F" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card className="shadow hover:shadow-lg transition-all duration-200">
          <CardHeader className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold">Product Performance</CardTitle>
                <CardDescription>How your products are doing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboardData.productPerformance.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">Sales Progress</div>
                    </div>
                    <Badge variant={product.progress >= 75 ? "default" : product.progress >= 50 ? "secondary" : "outline"}>
                      {product.progress}%
                    </Badge>
                  </div>
                  <Progress 
                    value={product.progress} 
                    className={`h-2 ${
                      product.progress >= 75 
                        ? "bg-green-100 [&>div]:bg-green-600" 
                        : product.progress >= 50 
                        ? "bg-yellow-100 [&>div]:bg-yellow-600" 
                        : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card className="mt-4 shadow hover:shadow-lg transition-all duration-200">
        <CardHeader className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Recent Products</CardTitle>
              <CardDescription>Your recently added products</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
