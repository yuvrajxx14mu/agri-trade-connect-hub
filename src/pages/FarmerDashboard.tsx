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

// Chart data for revenue trend
const data = [
  { name: "Jan", value: 40 },
  { name: "Feb", value: 30 },
  { name: "Mar", value: 45 },
  { name: "Apr", value: 50 },
  { name: "May", value: 60 },
  { name: "Jun", value: 70 },
  { name: "Jul", value: 80 }
];

// Mock data - In a real app, this would come from an API
const products = [
  { id: "P1", name: "Organic Wheat", quantity: "20 Quintals", status: "Listed", price: "₹2,200/Quintal" },
  { id: "P2", name: "Premium Rice", quantity: "15 Quintals", status: "In Auction", price: "₹3,500/Quintal" },
  { id: "P3", name: "Yellow Lentils", quantity: "10 Quintals", status: "Sold", price: "₹9,000/Quintal" },
  { id: "P4", name: "Red Chillies", quantity: "5 Quintals", status: "Listed", price: "₹12,000/Quintal" },
  { id: "P5", name: "Fresh Potatoes", quantity: "25 Quintals", status: "Sold", price: "₹1,800/Quintal" },
  { id: "P6", name: "Basmati Rice", quantity: "12 Quintals", status: "Listed", price: "₹6,500/Quintal" },
];

// Recent products for the table
const recentProducts = products.slice(0, 3);

const auctions = [
  { id: "A1", product: "Organic Wheat", status: "active", currentBid: "₹2,450/Quintal" },
  { id: "A2", product: "Premium Rice", status: "active", currentBid: "₹3,650/Quintal" },
  { id: "A3", product: "Yellow Lentils", status: "active", currentBid: "₹9,200/Quintal" },
];

const orders = [
  { id: "ORD123456", status: "pending", totalAmount: "₹60,000" },
  { id: "ORD123457", status: "pending", totalAmount: "₹45,000" },
];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  
  // Calculate statistics
  const totalProducts = products.length;
  const activeAuctions = auctions.filter(auction => auction.status === "active").length;
  const totalRevenue = orders
    .filter(order => order.status === "completed")
    .reduce((sum, order) => sum + parseInt(order.totalAmount.replace(/[^0-9]/g, '')), 0);
  const pendingOrders = orders.filter(order => order.status === "pending").length;

  // Calculate percentage changes (mock data - in real app would compare with previous period)
  const productChange = { value: "12%", positive: true };
  const auctionChange = { value: "2", positive: true };
  const revenueChange = { value: "8.5%", positive: true };
  const orderChange = { value: "1", positive: false };
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Farmer Dashboard" userName="Rajesh Kumar" userRole="farmer" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Products" 
          value={totalProducts.toString()} 
          icon={Sprout}
          change={productChange}
        />
        <StatCard 
          title="Active Auctions" 
          value={activeAuctions.toString()} 
          icon={Gavel}
          change={auctionChange}
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={IndianRupee}
          change={revenueChange}
        />
        <StatCard 
          title="Pending Orders" 
          value={pendingOrders.toString()} 
          icon={ShoppingCart}
          change={orderChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Track your monthly earnings and sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Organic Wheat</div>
                  <div className="text-sm text-muted-foreground">85%</div>
                </div>
                <Progress value={85} className="h-2 bg-primary/20" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Premium Rice</div>
                  <div className="text-sm text-muted-foreground">65%</div>
                </div>
                <Progress value={65} className="h-2 bg-primary/20" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Yellow Lentils</div>
                  <div className="text-sm text-muted-foreground">92%</div>
                </div>
                <Progress value={92} className="h-2 bg-primary/20" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Red Chillies</div>
                  <div className="text-sm text-muted-foreground">45%</div>
                </div>
                <Progress value={45} className="h-2 bg-primary/20" />
              </div>
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

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Your recently added or updated products</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate("/farmer-products/add")}
            >
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          product.status === "Sold" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : product.status === "In Auction" 
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/farmer-products/${product.id}`)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
