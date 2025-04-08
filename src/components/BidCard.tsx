
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BidCardProps {
  id: string;
  amount: number;
  previousAmount?: number;
  bidder: {
    name: string;
    avatar?: string;
    initials: string;
  };
  timestamp: Date;
  status: "pending" | "accepted" | "rejected" | "outbid";
}

const BidCard = ({
  id,
  amount,
  previousAmount,
  bidder,
  timestamp,
  status,
}: BidCardProps) => {
  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    outbid: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const priceDifference = previousAmount ? amount - previousAmount : 0;
  const isPriceIncrease = priceDifference > 0;

  return (
    <Card className="mb-3">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={bidder.avatar} alt={bidder.name} />
              <AvatarFallback className="text-xs sm:text-sm">{bidder.initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm sm:text-base">{bidder.name}</div>
              <div className="text-xxs sm:text-xs text-muted-foreground">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm sm:text-base">₹{amount.toLocaleString()}</div>
            {previousAmount && (
              <div className="flex items-center text-xxs sm:text-xs space-x-1">
                {isPriceIncrease ? (
                  <>
                    <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                    <span className="text-green-600">
                      +₹{priceDifference.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                    <span className="text-red-600">
                      ₹{Math.abs(priceDifference).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-xxs sm:text-xs text-muted-foreground">Bid #{id}</div>
          <Badge variant="outline" className={`text-xxs sm:text-xs ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidCard;
