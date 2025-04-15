import { BarChart3, Wallet, ShoppingCart, Gavel, ArrowUpRight, ShoppingBag } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];

const TraderDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeAuctions: [],
    productCategories: [],
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    changes: {
      orders: { value: "0%", positive: true },
      auctions: { value: "0%", positive: true },
      revenue: { value: "0%", positive: true },
      pendingOrders: { value: "0%", positive: true }
    }
  });

  const fetchDashboardData = async () => {
    if (!profile?.id) return;

    try {
      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
      const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Start of previous month

      // Fetch active auctions with proper joins and filters
      const { data: currentAuctions, error: auctionsError } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gt('end_time', now.toISOString());

      if (auctionsError) {
        console.error('Error fetching auctions:', {
          message: auctionsError.message,
          details: auctionsError.details,
          hint: auctionsError.hint,
          code: auctionsError.code
        });
        throw auctionsError;
      }

      // Fetch previous period auctions for comparison
      const { data: previousAuctions } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', currentPeriodStart.toISOString());

      // Calculate auction change
      const currentAuctionCount = currentAuctions?.length || 0;
      const previousAuctionCount = previousAuctions?.length || 0;
      const auctionChange = previousAuctionCount > 0 
        ? Math.round(((currentAuctionCount - previousAuctionCount) / previousAuctionCount) * 100)
        : 0;

      // If we get auctions, then try to fetch their product details
      let processedAuctions = [];
      if (currentAuctions && currentAuctions.length > 0) {
        const productIds = currentAuctions.map(auction => auction.product_id);
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products for auctions:', {
            message: productsError.message,
            details: productsError.details,
            hint: productsError.hint,
            code: productsError.code
          });
          throw productsError;
        }

        // Create a map of products for easy lookup
        const productsMap = (products || []).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});

        // Process auctions with product data
        processedAuctions = currentAuctions.map(auction => {
          const product = productsMap[auction.product_id];
          return {
            id: auction.id,
            name: product?.name || 'Unknown Product',
            quantity: auction.quantity || 0,
            unit: product?.unit || 'units',
            price: auction.current_price,
            location: product?.location || 'Unknown',
            category: product?.category || 'Uncategorized',
            end_time: auction.end_time,
            profiles: {
              name: `Farmer ${auction.farmer_id.slice(0, 8)}`
            }
          };
        });
      }

      // Fetch current period orders
      const { data: currentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*, products (*)')
        .eq('trader_id', profile.id)
        .gte('created_at', currentPeriodStart.toISOString())
        .lte('created_at', now.toISOString());

      if (ordersError) {
        console.error('Error fetching orders:', {
          message: ordersError.message,
          details: ordersError.details,
          hint: ordersError.hint,
          code: ordersError.code
        });
        throw ordersError;
      }

      // Fetch previous period orders
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('*, products (*)')
        .eq('trader_id', profile.id)
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', currentPeriodStart.toISOString());

      // Calculate order changes
      const currentOrderCount = currentOrders?.length || 0;
      const previousOrderCount = previousOrders?.length || 0;
      const orderChange = previousOrderCount > 0
        ? Math.round(((currentOrderCount - previousOrderCount) / previousOrderCount) * 100)
        : 0;

      // Calculate revenue changes
      const currentRevenue = currentOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const revenueChange = previousRevenue > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
        : 0;

      // Calculate pending orders change
      const currentPendingOrders = currentOrders?.filter(order => order.status === 'pending').length || 0;
      const previousPendingOrders = previousOrders?.filter(order => order.status === 'pending').length || 0;
      const pendingOrderChange = previousPendingOrders > 0
        ? Math.round(((currentPendingOrders - previousPendingOrders) / previousPendingOrders) * 100)
        : 0;

      // Fetch products to calculate category distribution
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('category, id')
        .eq('status', 'active');

      if (productsError) {
        console.error('Error fetching products:', {
          message: productsError.message,
          details: productsError.details,
          hint: productsError.hint,
          code: productsError.code
        });
        throw productsError;
      }

      // Calculate product category distribution
      const categoryCount = products?.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});

      const totalProducts = products?.length || 0;
      const productCategories = Object.entries(categoryCount || {}).map(([name, count]) => ({
        name,
        value: Math.round((count as number / totalProducts) * 100)
      }));

      setDashboardData({
        activeAuctions: processedAuctions,
        productCategories,
        totalOrders: currentOrderCount,
        totalRevenue: currentRevenue,
        pendingOrders: currentPendingOrders,
        recentOrders: currentOrders?.slice(0, 3) || [],
        changes: {
          orders: { value: `${Math.abs(orderChange)}%`, positive: orderChange >= 0 },
          auctions: { value: `${Math.abs(auctionChange)}%`, positive: auctionChange >= 0 },
          revenue: { value: `${Math.abs(revenueChange)}%`, positive: revenueChange >= 0 },
          pendingOrders: { value: `${Math.abs(pendingOrderChange)}%`, positive: pendingOrderChange >= 0 }
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `trader_id=eq.${profile?.id}`
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const auctionsSubscription = supabase
      .channel('auctions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auctions',
          filter: 'status=eq.active'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      ordersSubscription.unsubscribe();
      auctionsSubscription.unsubscribe();
    };
  }, [profile?.id]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="trader">
        <DashboardHeader title="Trader Dashboard" userName={profile?.name || ""} userRole="trader" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Trader Dashboard" userName={profile?.name || ""} userRole="trader" />
      
      <div className="w-full p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Orders" 
            value={dashboardData.totalOrders.toString()} 
            icon={ShoppingBag}
            change={dashboardData.changes.orders}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <StatCard 
            title="Active Auctions" 
            value={dashboardData.activeAuctions.length.toString()} 
            icon={Gavel}
            change={dashboardData.changes.auctions}
            className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <StatCard 
            title="Total Spent" 
            value={formatCurrency(dashboardData.totalRevenue)} 
            icon={Wallet}
            change={dashboardData.changes.revenue}
            className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <StatCard 
            title="Pending Orders" 
            value={dashboardData.pendingOrders.toString()} 
            icon={ShoppingCart}
            change={dashboardData.changes.pendingOrders}
            className="bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-200"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Auctions */}
          <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Active Auctions</CardTitle>
                  <CardDescription>Current ongoing auctions you can bid on</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/trader/auctions')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Ends In</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.activeAuctions.slice(0, 5).map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{auction.name}</div>
                            <div className="text-sm text-muted-foreground">{auction.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(auction.price)}</TableCell>
                        <TableCell>{auction.quantity} {auction.unit}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {new Date(auction.end_time) > new Date() 
                              ? formatDistanceToNow(new Date(auction.end_time), { addSuffix: true })
                              : "Ended"
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/trader/auctions/${auction.id}`)}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {dashboardData.activeAuctions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No active auctions at the moment
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Product Categories</CardTitle>
                  <CardDescription>Distribution of available products</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.productCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#2D6A4F"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {dashboardData.productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.products?.name || 'Unknown Product'}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dashboardData.recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No recent orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderDashboard;
