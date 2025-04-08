import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Bell } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketRates, setMarketRates] = useState<MarketRate[]>([]);
  const [activeTab, setActiveTab] = useState("market");
  const [selectedProduct, setSelectedProduct] = useState("all");

  useEffect(() => {
    const fetchMarketRates = async () => {
      try {
        const { data, error } = await supabase
          .from('market_rates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setMarketRates(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketRates();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Transform data for the chart
  const chartData = marketRates.reduce((acc: any[], rate) => {
    const existingWeek = acc.find(item => item.week === new Date(rate.date).toLocaleDateString());
    if (existingWeek) {
      existingWeek[rate.product_name.toLowerCase()] = rate.avg_price;
    } else {
      acc.push({
        week: new Date(rate.date).toLocaleDateString(),
        [rate.product_name.toLowerCase()]: rate.avg_price
      });
    }
    return acc;
  }, []);

  // Get unique products
  const uniqueProducts = Array.from(new Set(marketRates.map(rate => rate.product_name.toLowerCase())));

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Market Rates" userName="Rajesh Kumar" userRole="farmer" />
      
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
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}/${marketRates[0]?.unit || 'Quintal'}`, '']} />
                    <Legend />
                    {selectedProduct === "all" && marketRates.length > 0 && uniqueProducts.map(product => (
                      <Line 
                        key={product}
                        type="monotone" 
                        dataKey={product} 
                        name={product.charAt(0).toUpperCase() + product.slice(1)} 
                        stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} 
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
                  marketRates.reduce((acc: any, rate) => {
                    acc[rate.product_name] = {
                      price: rate.avg_price,
                      min: rate.min_price,
                      max: rate.max_price,
                      volume: rate.volume,
                      market: rate.market,
                      location: rate.location
                    };
                    return acc;
                  }, {})
                ).map(([product, data]: [string, any]) => (
                  <Card key={product}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium text-muted-foreground capitalize">
                          {product}
                        </h3>
                        <p className="text-3xl font-bold mt-2">₹{data.price}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Min: ₹{data.min}</span>
                          <span className="text-sm text-muted-foreground">Max: ₹{data.max}</span>
                        </div>
                        <span className="text-sm text-muted-foreground mt-1">
                          {data.volume} {marketRates[0]?.unit || 'Quintal'} at {data.market}, {data.location}
                        </span>
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
              <Button className="mt-4 sm:mt-0">
                Create New Alert
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Price alerts feature coming soon!
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default FarmerPricing;
