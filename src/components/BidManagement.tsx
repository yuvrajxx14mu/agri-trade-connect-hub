import { useState } from 'react';
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Bid {
  id: string;
  bidder_id: string;
  bidder_name: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'outbid';
  is_highest_bid: boolean;
  previous_bid_amount: number | null;
  expires_at: string;
  auction_end_time: string;
  created_at: string;
  message?: string;
}

interface BidManagementProps {
  bids: Bid[];
  onAcceptBid: (bid: Bid) => Promise<void>;
  onRejectBid: (bid: Bid) => Promise<void>;
  disabled?: boolean;
}

const BidManagement = ({ bids, onAcceptBid, onRejectBid, disabled = false }: BidManagementProps) => {
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);

  const handleAction = async () => {
    if (!selectedBid || !action) return;

    setIsProcessing(true);
    try {
      if (action === 'accept') {
        await onAcceptBid(selectedBid);
      } else {
        await onRejectBid(selectedBid);
      }
      setActionDialogOpen(false);
    } catch (error) {
      console.error('Error processing bid:', error);
    } finally {
      setIsProcessing(false);
      setSelectedBid(null);
      setAction(null);
    }
  };

  const openActionDialog = (bid: Bid, actionType: 'accept' | 'reject') => {
    setSelectedBid(bid);
    setAction(actionType);
    setActionDialogOpen(true);
  };

  const getBadgeVariant = (status: Bid['status']) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'outbid':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bidder</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell>{bid.bidder_name}</TableCell>
              <TableCell>{formatCurrency(bid.amount)}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(bid.status)}>
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {bid.status === 'pending' && !disabled && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => openActionDialog(bid, 'accept')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openActionDialog(bid, 'reject')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'accept' ? 'Accept Bid' : 'Reject Bid'}
            </DialogTitle>
            <DialogDescription>
              {action === 'accept'
                ? `Are you sure you want to accept the bid of ${selectedBid ? formatCurrency(selectedBid.amount) : ''} from ${selectedBid?.bidder_name}? This will end the auction.`
                : `Are you sure you want to reject the bid of ${selectedBid ? formatCurrency(selectedBid.amount) : ''} from ${selectedBid?.bidder_name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'accept' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : action === 'accept' ? (
                'Accept Bid'
              ) : (
                'Reject Bid'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidManagement; 