
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import OrderCard from "@/components/OrderCard";

// Sample data for orders
const orders = [
  {
    id: "ORD123456",
    date: new Date(2025, 3, 5),
    customer: { name: "Vikram Sharma", avatar: "", initials: "VS" },
    products: [
      { name: "Organic Wheat", quantity: 20, price: "₹2,200/Quintal" }
    ],
    totalAmount: "₹44,000",
    status: "confirmed",
    paymentStatus: "paid"
  },
  {
    id: "ORD123457",
    date: new Date(2025, 3, 3),
    customer: { name: "Rahul Mehta", avatar: "", initials: "RM" },
    products: [
      { name: "Premium Rice", quantity: 15, price: "₹3,500/Quintal" }
    ],
    totalAmount: "₹52,500",
    status: "processing",
    paymentStatus: "pending"
  },
  {
    id: "ORD123458",
    date: new Date(2025, 3, 1),
    customer: { name: "Anjali Patel", avatar: "", initials: "AP" },
    products: [
      { name: "Yellow Lentils", quantity: 10, price: "₹9,000/Quintal" }
    ],
    totalAmount: "₹90,000",
    status: "shipped",
    paymentStatus: "paid"
  },
  {
    id: "ORD123459",
    date: new Date(2025, 2, 28),
    customer: { name: "Deepak Kumar", avatar: "", initials: "DK" },
    products: [
      { name: "Red Chillies", quantity: 5, price: "₹12,000/Quintal" }
    ],
    totalAmount: "₹60,000",
    status: "delivered",
    paymentStatus: "paid"
  },
  {
    id: "ORD123460",
    date: new Date(2025, 2, 25),
    customer: { name: "Priya Singh", avatar: "", initials: "PS" },
    products: [
      { name: "Basmati Rice", quantity: 12, price: "₹6,500/Quintal" }
    ],
    totalAmount: "₹78,000",
    status: "completed",
    paymentStatus: "paid"
  }
];

const FarmerOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = 
      (activeTab === "active" && ["confirmed", "processing", "shipped"].includes(order.status)) ||
      (activeTab === "completed" && ["delivered", "completed", "cancelled"].includes(order.status));
    
    return matchesSearch && matchesTab;
  });
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Orders" userName="Rajesh Kumar" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Manage and track all your product orders</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">Active Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by order ID, customer, or product..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    date={order.date}
                    customer={order.customer}
                    products={order.products}
                    totalAmount={order.totalAmount}
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                    onClick={() => navigate(`/farmer-orders/${order.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "active" 
                    ? "You don't have any active orders at the moment." 
                    : "You don't have any completed orders yet."}
                </p>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FarmerOrders;
