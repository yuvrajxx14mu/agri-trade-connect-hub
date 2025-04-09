
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePriceAlerts, PriceAlert } from "@/hooks/usePriceAlerts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Bell, AlertTriangle, Trash2, Plus } from "lucide-react";

interface MarketRate {
  id: string;
  product_name: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  volume: number;
  market: string;
  location: string;
  date: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

const FarmerPricing = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { alerts, createAlert, deleteAlert, toggleAlertStatus, loading: alertsLoading } = usePriceAlerts();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [activeTab, setActiveTab] = useState("market");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    product_name: "",
    condition: "above",
    target_price: 0,
    status: "active"
  });

  useEffect(() => {
    const fetchMarketRates = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('market_rates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMarketRates(data || []);
        
        // Set default product if none selected
        if (selectedProduct === "all" && data && data.length > 0) {
          setSelectedProduct(data[0].product_name.toLowerCase());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching market rates:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMarketRates();
    
    // Setup polling for real-time updates (every 60 seconds)
    const interval = setInterval(fetchMarketRates, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCreateAlert = async () => {
    if (!newAlert.product_name || newAlert.target_price <= 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const result = await createAlert({
      product_name: newAlert.product_name,
      condition: newAlert.condition,
      target_price: newAlert.target_price,
      status: newAlert.status
    });
    
    if (result) {
      setIsCreateAlertOpen(false);
      setNewAlert({
        product_name: "",
        condition: "above",
        target_price: 0,
        status: "active"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="Market Rates" userName={profile?.name || ""} userRole="farmer" />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-muted-foreground">Loading market rates...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="Market Rates" userName={profile?.name || ""} userRole="farmer" />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Transform data for the chart
  const chartData = marketRates.reduce((acc: any[], rate) => {
    const formattedDate = new Date(rate.date).toLocaleDateString();
    const existingDateIndex = acc.findIndex(item => item.date === formattedDate);
    
    if (existingDateIndex !== -1) {
      acc[existingDateIndex][rate.product_name.toLowerCase()] = rate.avg_price;
    } else {
      const newItem: any = { date: formattedDate };
      newItem[rate.product_name.toLowerCase()] = rate.avg_price;
      acc.push(newItem);
    }
    
    return acc;
  }, []);
  
  // Sort chart data by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get unique products
  const uniqueProducts = Array.from(new Set(marketRates.map(rate => rate.product_name.toLowerCase())));

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Market Rates" userName={profile?.name || ""} userRole="farmer" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="market">Market Rates</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market">
          <Card className="mb-6">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Price Trends
                </CardTitle>
                <CardDescription>Weekly price trends for key products</CardDescription>
              </div>
              <div className="mt-4 sm:mt-0">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {uniqueProducts.map(product => (
                      <SelectItem key={product} value={product}>
                        {product.charAt(0).toUpperCase() + product.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}/${marketRates[0]?.unit || 'Quintal'}`, '']} />
                    <Legend />
                    {selectedProduct === "all" && marketRates.length > 0 && uniqueProducts.map((product, index) => (
                      <Line 
                        key={product}
                        type="monotone" 
                        dataKey={product} 
                        name={product.charAt(0).toUpperCase() + product.slice(1)} 
                        stroke={`hsl(${(index * 360) / uniqueProducts.length}, 70%, 50%)`} 
                        activeDot={{ r: 8 }} 
                      />
                    ))}
                    {selectedProduct !== "all" && (
                      <Line 
                        type="monotone" 
                        dataKey={selectedProduct} 
                        name={selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1)} 
                        stroke="#2563EB" 
                        activeDot={{ r: 8 }} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Market Rates</CardTitle>
              <CardDescription>Latest prices for agricultural products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketRates.length > 0 && Object.entries(
                  marketRates.reduce((acc: Record<string, MarketRate>, rate) => {
                    if (!acc[rate.product_name] || new Date(rate.date) > new Date(acc[rate.product_name].date)) {
                      acc[rate.product_name] = rate;
                    }
                    return acc;
                  }, {})
                ).map(([product, data]) => (
                  <Card key={product}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium text-muted-foreground capitalize">
                          {product}
                        </h3>
                        <p className="text-3xl font-bold mt-2">₹{data.avg_price}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Min: ₹{data.min_price}</span>
                          <span className="text-sm text-muted-foreground">Max: ₹{data.max_price}</span>
                        </div>
                        <span className="text-sm text-muted-foreground mt-1">
                          {data.volume} {data.unit} at {data.market}, {data.location}
                        </span>
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNewAlert({
                                product_name: product,
                                condition: "above",
                                target_price: data.avg_price,
                                status: "active"
                              });
                              setIsCreateAlertOpen(true);
                            }}
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Set Alert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Price Alerts
                </CardTitle>
                <CardDescription>Get notified when prices reach your target</CardDescription>
              </div>
              <Dialog open={isCreateAlertOpen} onOpenChange={setIsCreateAlertOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 sm:mt-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Price Alert</DialogTitle>
                    <DialogDescription>
                      Set up an alert to be notified when a product reaches your target price
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="product">Product</Label>
                      <Select 
                        value={newAlert.product_name} 
                        onValueChange={(value) => setNewAlert(prev => ({ ...prev, product_name: value }))}
                      >
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueProducts.map(product => (
                            <SelectItem key={product} value={product.charAt(0).toUpperCase() + product.slice(1)}>
                              {product.charAt(0).toUpperCase() + product.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select 
                        value={newAlert.condition} 
                        onValueChange={(value) => setNewAlert(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Price rises above</SelectItem>
                          <SelectItem value="below">Price falls below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Target Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newAlert.target_price}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, target_price: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateAlertOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateAlert}>Create Alert</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading your price alerts...</p>
                </div>
              ) : alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-5 w-5 ${alert.status === 'active' ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <div>
                            <h3 className="font-medium">{alert.product_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Alert when price goes {alert.condition} ₹{alert.target_price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Active</span>
                            <Switch
                              checked={alert.status === 'active'}
                              onCheckedChange={() => toggleAlertStatus(alert.id, alert.status)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAlert(alert.id)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No price alerts set</h3>
                  <p className="text-muted-foreground mb-6">
                    Create alerts to be notified when products reach your target price
                  </p>
                  <Button onClick={() => setIsCreateAlertOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Alert
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default FarmerPricing;
