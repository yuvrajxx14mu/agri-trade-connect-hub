
import React from "react";
import { format } from "date-fns";
import { 
  Truck, 
  MapPin, 
  Package, 
  Calendar, 
  ClipboardList,
  ArrowRight 
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ShipmentStatus = 
  | "processing" 
  | "packed" 
  | "shipped" 
  | "in_transit" 
  | "out_for_delivery" 
  | "delivered" 
  | "cancelled";

interface ShipmentCardProps {
  id: string;
  orderId: string;
  trackingNumber: string;
  items: {
    name: string;
    quantity: number;
  }[];
  status: ShipmentStatus;
  dispatchDate: Date | null;
  estimatedDelivery: Date | null;
  currentLocation: string;
  destination: string;
  progress: number;
  onClick: () => void;
}

const ShipmentCard = ({
  id,
  orderId,
  trackingNumber,
  items,
  status,
  dispatchDate,
  estimatedDelivery,
  currentLocation,
  destination,
  progress,
  onClick,
}: ShipmentCardProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "processing":
        return {
          label: "Processing",
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        };
      case "packed":
        return {
          label: "Packed",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "shipped":
        return {
          label: "Shipped",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "in_transit":
        return {
          label: "In Transit",
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          color: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "delivered":
        return {
          label: "Delivered",
          color: "bg-green-50 text-green-700 border-green-200",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Shipment #{id.slice(0, 8)}</h3>
              <Badge variant="outline" className="text-xs">
                Order #{orderId.slice(0, 8)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracking: {trackingNumber}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>
        </div>
        
        <div className="space-y-2 my-3">
          <div className="text-sm text-muted-foreground mb-1 flex items-center">
            <Package className="h-3.5 w-3.5 mr-1" />
            Items ({items.length})
          </div>
          <div className="space-y-1">
            {items.slice(0, 2).map((item, index) => (
              <div key={index} className="text-sm flex justify-between">
                <span className="truncate mr-2">{item.name}</span>
                <span className="font-medium whitespace-nowrap">x{item.quantity}</span>
              </div>
            ))}
            {items.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{items.length - 2} more items
              </div>
            )}
          </div>
        </div>
        
        <div className="my-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {currentLocation}
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {destination}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {dispatchDate && (
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Dispatched
              </div>
              <div>{format(dispatchDate, "MMM d, yyyy")}</div>
            </div>
          )}
          {estimatedDelivery && (
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Truck className="h-3.5 w-3.5 mr-1" />
                Est. Delivery
              </div>
              <div>{format(estimatedDelivery, "MMM d, yyyy")}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between"
          onClick={onClick}
        >
          <span className="flex items-center">
            <ClipboardList className="h-4 w-4 mr-2" />
            Track Shipment
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShipmentCard;
