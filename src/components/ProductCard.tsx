
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Truck, Tag, Package, ShoppingCart, Gavel } from "lucide-react";

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
  userRole 
}: ProductCardProps) => {
  const navigate = useNavigate();
  
  const defaultImage = "https://images.unsplash.com/photo-1620200423727-8137eea96a61?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  
  const isAuction = status === "In Auction";

  const handleClick = () => {
    if (userRole === "farmer") {
      navigate(`/farmer-products/${id}`);
    } else {
      if (isAuction) {
        navigate(`/trader-auctions/${id}`);
      } else {
        navigate(`/trader-products/${id}`);
      }
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (userRole === "trader") {
      if (isAuction) {
        navigate(`/trader-auctions/${id}`);
      } else {
        navigate(`/trader-order-create/${id}`);
      }
    } else {
      // Farmer actions
      if (status === "Listed") {
        navigate(`/farmer-auctions/create?product=${id}`);
      } else {
        navigate(`/farmer-products/${id}/edit`);
      }
    }
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="relative h-44 overflow-hidden">
        <img 
          src={image || defaultImage} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${
            status === "Listed" 
              ? "bg-green-50 text-green-700 border-green-200" 
              : status === "In Auction"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}
        >
          {status}
        </Badge>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-lg line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{category}</p>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Package className="h-4 w-4 mr-1" />
            <span>{quantity}</span>
          </div>
          
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="font-medium">{price}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button 
          className="w-full"
          onClick={handleActionClick}
        >
          {userRole === "trader" ? (
            <>
              {isAuction ? (
                <>
                  <Gavel className="mr-2 h-4 w-4" />
                  Place Bid
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase
                </>
              )}
            </>
          ) : (
            // Farmer view
            <>
              {status === "Listed" ? (
                <>
                  <Gavel className="mr-2 h-4 w-4" />
                  Create Auction
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Manage
                </>
              )}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
