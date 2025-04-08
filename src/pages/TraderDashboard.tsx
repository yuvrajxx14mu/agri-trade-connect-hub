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

const activeAuctions = [
  { id: "A1", product: "Organic Wheat", farmer: "Rajesh Kumar", quantity: "20 Quintals", currentBid: "₹2,450/Quintal", timeLeft: "2 hours" },
  { id: "A2", product: "Premium Rice", farmer: "Anand Singh", quantity: "15 Quintals", currentBid: "₹3,600/Quintal", timeLeft: "45 minutes" },
  { id: "A3", product: "Red Chillies", farmer: "Meena Patel", quantity: "5 Quintals", currentBid: "₹12,000/Quintal", timeLeft: "3 hours" },
  { id: "A4", product: "Yellow Lentils", farmer: "Suresh Verma", quantity: "10 Quintals", currentBid: "₹9,200/Quintal", timeLeft: "1 hour" },
];

const productCategories = [
  { name: "Cereals", value: 35 },
  { name: "Pulses", value: 25 },
  { name: "Fruits", value: 15 },
  { name: "Vegetables", value: 20 },
  { name: "Spices", value: 5 },
];

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];

const TraderDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Trader Dashboard" userName="Vikram Sharma" userRole="trader" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Auctions" 
          value="24" 
          icon={Gavel}
          change={{ value: "5", positive: true }}
          className="border-l-4 border-agri-trader"
        />
        <StatCard 
          title="Purchased Items" 
          value="18" 
          icon={ShoppingBag}
          change={{ value: "3", positive: true }}
          className="border-l-4 border-agri-trader"
        />
        <StatCard 
          title="Total Spent" 
          value="₹2,45,600" 
          icon={Wallet}
          change={{ value: "12.5%", positive: true }}
          className="border-l-4 border-agri-trader"
        />
        <StatCard 
          title="Pending Orders" 
          value="3" 
          icon={ShoppingCart}
          change={{ value: "1", positive: false }}
          className="border-l-4 border-agri-trader"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <CardTitle>Active Auctions</CardTitle>
                <CardDescription>Auctions currently open for bidding</CardDescription>
              </div>
              <Button 
                onClick={() => navigate("/trader-auctions")}
                className="mt-2 md:mt-0"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAuctions.slice(0, 3).map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{auction.product}</div>
                        <div className="text-xs text-muted-foreground">by {auction.farmer}</div>
                      </div>
                    </TableCell>
                    <TableCell>{auction.quantity}</TableCell>
                    <TableCell className="font-medium">{auction.currentBid}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          parseInt(auction.timeLeft) < 1 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {auction.timeLeft}
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
            <CardTitle>Categories Overview</CardTitle>
            <CardDescription>Product categories in the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategories.map((entry, index) => (
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

      <Card>
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
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Wheat</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Rice</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Organic</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pulses</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Spices</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Vegetables</Badge>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderDashboard;
