
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package, Calendar, Truck, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderCardProps {
  id: string;
  products: {
    name: string;
    quantity: string;
  }[];
  totalAmount: string;
  orderDate: string;
  deliveryDate: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  userRole: "farmer" | "trader";
}

const OrderCard = ({
  id,
  products,
  totalAmount,
  orderDate,
  deliveryDate,
  status,
  userRole,
}: OrderCardProps) => {
  const navigate = useNavigate();
  
  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  
  const basePath = userRole === "farmer" ? "/farmer-orders" : "/trader-orders";
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <h3 className="font-medium">Order #{id}</h3>
          <Badge 
            variant="outline" 
            className={statusColors[status]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2 my-3">
          {products.map((product, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{product.name}</span>
              </div>
              <span className="text-sm font-medium">{product.quantity}</span>
            </div>
          ))}
        </div>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Order Date
            </div>
            <div>{orderDate}</div>
          </div>
          <div>
            <div className="flex items-center text-muted-foreground mb-1">
              {deliveryDate ? (
                <Truck className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Clock className="h-3.5 w-3.5 mr-1" />
              )}
              {deliveryDate ? "Delivery Date" : "Pending Delivery"}
            </div>
            <div>{deliveryDate || "Not scheduled"}</div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div className="font-bold">{totalAmount}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between"
          onClick={() => navigate(`${basePath}/${id}`)}
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
