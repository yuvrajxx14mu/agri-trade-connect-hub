import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Bid {
  id: string;
  bidder_id: string;
  bidder_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface BidHistoryProps {
  bids: Bid[];
}

const BidHistory = ({ bids }: BidHistoryProps) => {
  const getBidStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-4">
      {bids.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No bids placed yet
        </div>
      ) : (
        bids.map((bid) => (
          <div
            key={bid.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="space-y-1">
              <p className="font-medium">{bid.bidder_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold">{formatCurrency(bid.amount)}</p>
              <Badge variant="outline" className={getBidStatusColor(bid.status)}>
                {bid.status}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BidHistory; 