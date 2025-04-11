import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Gavel } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BidDialogProps {
  auction: {
    id: string;
    current_price: number;
    min_increment: number;
    end_time: string;
  };
  onBid: (amount: number) => Promise<void>;
}

const BidDialog = ({ auction, onBid }: BidDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);

  const handleBid = async () => {
    if (!bidAmount) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;

    setIsBidding(true);
    try {
      await onBid(amount);
      setIsOpen(false);
      setBidAmount("");
    } catch (error) {
      console.error("Error placing bid:", error);
    } finally {
      setIsBidding(false);
    }
  };

  const minBid = auction.current_price + auction.min_increment;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={new Date(auction.end_time) <= new Date()}>
          <Gavel className="mr-2 h-4 w-4" />
          {new Date(auction.end_time) <= new Date() ? "Auction Ended" : "Place Bid"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Enter your bid amount. Minimum bid is {formatCurrency(minBid)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Bid Amount</Label>
            <Input
              id="bidAmount"
              type="number"
              min={minBid}
              step={auction.min_increment}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Enter amount (min ${formatCurrency(minBid)})`}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Current Price: {formatCurrency(auction.current_price)}</p>
            <p>Minimum Increment: {formatCurrency(auction.min_increment)}</p>
            <p>Minimum Bid: {formatCurrency(minBid)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBid} disabled={isBidding || !bidAmount || parseFloat(bidAmount) < minBid}>
            {isBidding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Bid...
              </>
            ) : (
              "Confirm Bid"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BidDialog; 