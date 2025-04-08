
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, AlertCircle, Info, Percent, Calendar, Download, RefreshCw } from "lucide-react";

const priceData = [
  { month: "Jan", wheat: 2050, rice: 3200, lentils: 8500, potatoes: 1500 },
  { month: "Feb", wheat: 2100, rice: 3250, lentils: 8600, potatoes: 1450 },
  { month: "Mar", wheat: 2150, rice: 3300, lentils: 8800, potatoes: 1400 },
  { month: "Apr", wheat: 2200, rice: 3500, lentils: 9000, potatoes: 1350 },
  { month: "May", wheat: 2250, rice: 3600, lentils: 9100, potatoes: 1500 },
  { month: "Jun", wheat: 2150, rice: 3550, lentils: 9200, potatoes: 1600 },
  { month: "Jul", wheat: 2100, rice: 3450, lentils: 9000, potatoes: 1700 },
];

const marketRates = [
  { product: "Wheat", variety: "HD-2967", currentPrice: "₹2,250", change: "+5.2%", trend: "up", location: "Amritsar" },
  { product: "Rice", variety: "Basmati", currentPrice: "₹3,600", change: "+2.8%", trend: "up", location: "Karnal" },
  { product: "Lentils", variety: "Yellow", currentPrice: "₹9,100", change: "+3.4%", trend: "up", location: "Indore" },
  { product: "Potatoes", variety: "Regular", currentPrice: "₹1,700", change: "+13.3%", trend: "up", location: "Agra" },
  { product: "Onions", variety: "Red", currentPrice: "₹2,500", change: "-3.8%", trend: "down", location: "Lasalgaon" },
  { product: "Tomatoes", variety: "Hybrid", currentPrice: "₹4,200", change: "+12.0%", trend: "up", location: "Nashik" },
  { product: "Chillies", variety: "Red", currentPrice: "₹12,000", change: "-2.4%", trend: "down", location: "Guntur" },
  { product: "Apples", variety: "Shimla", currentPrice: "₹8,500", change: "+1.2%", trend: "up", location: "Himachal Pradesh" },
];

const myProducts = [
  { name: "Organic Wheat", variety: "HD-2967", myPrice: "₹2,200", marketPrice: "₹2,250", difference: "-2.2%", recommendation: "increase" },
  { name: "Premium Rice", variety: "Basmati", myPrice: "₹3,500", marketPrice: "₹3,600", difference: "-2.8%", recommendation: "increase" },
  { name: "Yellow Lentils", variety: "Regular", myPrice: "₹9,000", marketPrice: "₹9,100", difference: "-1.1%", recommendation: "maintain" },
  { name: "Fresh Potatoes", variety: "Regular", myPrice: "₹1,800", marketPrice: "₹1,700", difference: "+5.9%", recommendation: "maintain" },
  { name: "Basmati Rice", variety: "Premium", myPrice: "₹6,500", marketPrice: "₹6,300", difference: "+3.2%", recommendation: "maintain" },
];

const locations = [
  "All India",
  "Amritsar",
  "Karnal",
  "Indore",
  "Agra",
  "Nashik",
  "Guntur",
  "Himachal Pradesh",
  "Lasalgaon",
];

const FarmerPricing = () => {
  const [selectedLocation, setSelectedLocation] = useState("All India");
  const [selectedTimeframe, setSelectedTimeframe] = useState("6m");

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "increase":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Increase Price
          </Badge>
        );
      case "decrease":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <TrendingDown className="h-3 w-3 mr-1" />
            Consider Decreasing
          </Badge>
        );
      case "maintain":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Info className="h-3 w-3 mr-1" />
            Price Optimal
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Market Pricing" userName="Rajesh Kumar" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Wheat Price Trend</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">₹2,250</span>
                  <span className="text-green-600 text-sm font-medium">+5.2%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                <ArrowUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="h-12 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <Line type="monotone" dataKey="wheat" stroke="#2D6A4F" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Rice Price Trend</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">₹3,600</span>
                  <span className="text-green-600 text-sm font-medium">+2.8%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                <ArrowUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="h-12 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <Line type="monotone" dataKey="rice" stroke="#40916C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Lentils Price Trend</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">₹9,100</span>
                  <span className="text-green-600 text-sm font-medium">+3.4%</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                <ArrowUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="h-12 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <Line type="monotone" dataKey="lentils" stroke="#52B788" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="market" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Market Rates</TabsTrigger>
          <TabsTrigger value="your-products">Your Products</TabsTrigger>
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <CardTitle>Current Market Rates</CardTitle>
                  <CardDescription>Current prices across agricultural markets</CardDescription>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Change (1 Month)</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketRates.map((rate, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{rate.product}</TableCell>
                        <TableCell>{rate.variety}</TableCell>
                        <TableCell>{rate.currentPrice}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {rate.trend === "up" ? (
                              <div className="flex items-center text-green-600">
                                <ArrowUp className="mr-1 h-4 w-4" />
                                {rate.change}
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <ArrowDown className="mr-1 h-4 w-4" />
                                {rate.change}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{rate.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last updated: April 8, 2025
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="your-products">
          <Card>
            <CardHeader>
              <CardTitle>Your Product Pricing</CardTitle>
              <CardDescription>Compare your prices with current market rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Your Price</TableHead>
                      <TableHead>Market Price</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.variety}</TableCell>
                        <TableCell>{product.myPrice}</TableCell>
                        <TableCell>{product.marketPrice}</TableCell>
                        <TableCell>
                          <div className={product.difference.startsWith("+") ? "text-green-600" : "text-red-600"}>
                            {product.difference}
                          </div>
                        </TableCell>
                        <TableCell>{getRecommendationBadge(product.recommendation)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-md">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium mb-1">Pricing Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      Some of your products are priced below current market rates. Consider adjusting your prices for optimal returns. Our AI-powered recommendation system analyzes market trends to help you make informed pricing decisions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <CardTitle>Price Trends Analysis</CardTitle>
                  <CardDescription>Historical price movements for key commodities</CardDescription>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="6m">6 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="wheat" 
                      name="Wheat" 
                      stackId="1" 
                      stroke="#2D6A4F" 
                      fill="#2D6A4F" 
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rice" 
                      name="Rice" 
                      stackId="2" 
                      stroke="#40916C" 
                      fill="#40916C" 
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lentils" 
                      name="Lentils" 
                      stackId="3" 
                      stroke="#52B788" 
                      fill="#52B788" 
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="potatoes" 
                      name="Potatoes" 
                      stackId="4" 
                      stroke="#74C69D" 
                      fill="#74C69D" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Monthly Price Variations</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="wheat" name="Wheat" fill="#2D6A4F" />
                        <Bar dataKey="rice" name="Rice" fill="#40916C" />
                        <Bar dataKey="lentils" name="Lentils" fill="#52B788" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Market Analysis</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-blue-700 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Upward Trend</h4>
                          <p className="text-sm">
                            Wheat, Rice, and Lentils prices show a steady upward trend over the last 6 months, with an average increase of 3.8%.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-md">
                      <div className="flex items-start gap-3">
                        <Percent className="h-5 w-5 text-amber-700 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Price Volatility</h4>
                          <p className="text-sm">
                            Vegetable prices (Potatoes, Onions, Tomatoes) show higher volatility with fluctuations of up to 13% month-to-month.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-md">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Seasonal Factors</h4>
                          <p className="text-sm">
                            Prices generally peak in April-May before the new harvest brings some relief in June-July.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default FarmerPricing;
