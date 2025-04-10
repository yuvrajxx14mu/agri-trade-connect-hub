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

        // Fetch active auctions - updated to check for inactive status with auction_id
        const { data: auctions } = await supabase
          .from('products')
          .select('*')
          .eq('farmer_id', profile.id)
          .eq('status', 'inactive')
          .not('auction_id', 'is', null);

        // Fetch total revenue from completed orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('farmer_id', profile.id)
          .eq('status', 'completed');

        // Fetch pending orders - updated to include all relevant statuses
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
    const soldQuantity = product.quantity - product.available_quantity;
    return Math.round((soldQuantity / product.quantity) * 100);
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
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Farmer Dashboard" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Products" 
          value={dashboardData.totalProducts.toString()} 
          icon={Sprout}
          change={productChange}
        />
        <StatCard 
          title="Active Auctions" 
          value={dashboardData.activeAuctions.toString()} 
          icon={Gavel}
          change={auctionChange}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(dashboardData.totalRevenue)} 
          icon={IndianRupee}
          change={revenueChange}
        />
        <StatCard 
          title="Pending Orders" 
          value={dashboardData.pendingOrders.toString()} 
          icon={ShoppingCart}
          change={orderChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Track your monthly earnings and sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2D6A4F" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>How your products are doing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboardData.productPerformance.map((product, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.progress}%</div>
                  </div>
                  <Progress value={product.progress} className="h-2 bg-primary/20" />
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/farmer-products")}
              >
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
