
import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Tag, ShoppingCart, Gavel, Eye } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  quantity: string;
  price: string;
  location: string;
  status: string;
  image?: string;
  userRole: "farmer" | "trader";
}

const ProductCard = ({
  id,
  name,
  category,
  quantity,
  price,
  location,
  status,
  image,
  userRole,
}: ProductCardProps) => {
  const navigate = useNavigate();
  
  const statusColors = {
    Listed: "bg-yellow-50 text-yellow-700 border-yellow-200",
    "In Auction": "bg-blue-50 text-blue-700 border-blue-200",
    Sold: "bg-green-50 text-green-700 border-green-200",
  };
  
  const basePath = userRole === "farmer" ? "/farmer-products" : "/trader-market";
  const auctionPath = userRole === "farmer" ? "/farmer-auctions" : "/trader-auctions";
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Package className="h-16 w-16 text-muted-foreground opacity-20" />
          </div>
        )}
        <Badge 
          variant="outline" 
          className={`absolute top-2 right-2 ${statusColors[status as keyof typeof statusColors] || "bg-muted"}`}
        >
          {status}
        </Badge>
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <Tag className="h-3.5 w-3.5 mr-1" />
            {category}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {location}
          </div>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <div className="text-xs text-muted-foreground">Quantity</div>
            <div className="font-medium">{quantity}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Price</div>
            <div className="font-bold text-primary">{price}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => navigate(`${basePath}/${id}`)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
        
        {userRole === "farmer" && status === "Listed" ? (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-agri-farmer"
            onClick={() => navigate(`${basePath}/${id}/auction`)}
          >
            <Gavel className="h-4 w-4 mr-1" />
            Auction
          </Button>
        ) : userRole === "trader" && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-agri-trader"
            onClick={() => navigate(status === "In Auction" ? `${auctionPath}/${id}` : `/trader-orders/create/${id}`)}
          >
            {status === "In Auction" ? (
              <>
                <Gavel className="h-4 w-4 mr-1" />
                Bid
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Buy
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
