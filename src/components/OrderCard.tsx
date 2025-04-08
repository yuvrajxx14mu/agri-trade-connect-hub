
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export interface OrderCardProps {
  id: string;
  orderDate: Date;
  customer: {
    name: string;
    avatar: string;
    initials: string;
  };
  products: {
    name: string;
    quantity: string;
    price: string;
  }[];
  totalAmount: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "completed";
  paymentStatus: string;
  onClick?: () => void;
}

const OrderCard = ({
  id,
  orderDate,
  customer,
  products,
  totalAmount,
  status,
  paymentStatus,
  onClick,
}: OrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "confirmed":
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered":
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-0">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-sm sm:text-base">{id}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {formatDate(orderDate)}
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:gap-2 items-end">
              <Badge variant="outline" className={`text-xxs sm:text-xs ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="outline" className={`text-xxs sm:text-xs ${getPaymentStatusColor(paymentStatus)}`}>
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-4">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={customer.avatar} alt={customer.name} />
            <AvatarFallback className="text-xs sm:text-sm">{customer.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base truncate">{customer.name}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {products.length === 1
                ? products[0].name
                : `${products[0].name} and ${products.length - 1} more`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm sm:text-base">{totalAmount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
