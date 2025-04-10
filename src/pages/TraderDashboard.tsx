import { BarChart3, Wallet, ShoppingCart, Gavel, ArrowUpRight, Search, ShoppingBag } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];

const TraderDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeAuctions: [],
    productCategories: [],
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch active auctions with proper joins and filters
        const { data: auctions, error: auctionsError } = await supabase
          .from('auctions')
          .select(`
            id,
            current_price,
            end_time,
            product_id,
            products!auctions_product_id_fkey (
              id,
              name,
              quantity,
              unit,
              farmer_name,
              location,
              category
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);

        if (auctionsError) {
          console.error('Error fetching auctions:', auctionsError);
          throw auctionsError;
        }

        // Process auctions data with proper null checks
        const processedAuctions = (auctions || [])
          .filter(auction => auction.products) // Ensure product data exists
          .map(auction => ({
            id: auction.id,
            name: auction.products.name,
            quantity: auction.products.quantity,
            unit: auction.products.unit,
            price: auction.current_price,
            location: auction.products.location,
            category: auction.products.category,
            end_time: auction.end_time,
            profiles: {
              name: auction.products.farmer_name
            }
          }));

        // Fetch orders statistics
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('trader_id', profile.id);

        // Calculate product categories distribution
        const { data: products } = await supabase
          .from('products')
          .select('category')
          .eq('status', 'active');

        // Process product categories
        const categoryCounts = products?.reduce((acc, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {});

        const totalProducts = products?.length || 0;
        const productCategories = Object.entries(categoryCounts || {}).map(([name, count]) => ({
          name,
          value: Math.round((count as number / totalProducts) * 100)
        }));

        // Calculate order statistics
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
        const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

        // Get recent orders
        const recentOrders = orders?.slice(0, 3) || [];

        setDashboardData({
          activeAuctions: processedAuctions,
          productCategories,
          totalOrders,
          totalRevenue,
          pendingOrders,
          recentOrders
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="trader">
        <DashboardHeader title="Trader Dashboard" userName={profile?.name || ""} userRole="trader" />
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Trader Dashboard" userName={profile?.name || ""} userRole="trader" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Orders" 
          value={dashboardData.totalOrders.toString()} 
          icon={ShoppingCart}
          change={{ value: "12%", positive: true }}
        />
        <StatCard 
          title="Active Auctions" 
          value={dashboardData.activeAuctions.length.toString()} 
          icon={Gavel}
          change={{ value: "2", positive: true }}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(dashboardData.totalRevenue)} 
          icon={Wallet}
          change={{ value: "8.5%", positive: true }}
        />
        <StatCard 
          title="Pending Orders" 
          value={dashboardData.pendingOrders.toString()} 
          icon={ShoppingBag}
          change={{ value: "1", positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Auctions</CardTitle>
            <CardDescription>Current auctions you can participate in</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.activeAuctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{auction.name}</div>
                        <div className="text-xs text-muted-foreground">by {auction.profiles?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{`${auction.quantity} ${auction.unit}`}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(auction.price)}/{auction.unit}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => navigate(`/trader-auctions/${auction.id}`)}
                        className="bg-agri-trader"
                      >
                        Bid Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Distribution of available products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.productCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.productCategories.map((entry, index) => (
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
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Market Search</CardTitle>
          <CardDescription>Find products by name, type, or farmer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-8"
              />
            </div>
            <Button onClick={() => navigate("/trader-market")} className="bg-agri-trader">
              <Search className="mr-2 h-4 w-4" />
              Search Market
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboardData.productCategories.map((category) => (
              <Badge 
                key={category.name}
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => navigate(`/trader-market?category=${category.name}`)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderDashboard;
