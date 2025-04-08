
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Gavel, ArrowUpRight, Package, Clock, CheckCircle, XCircle } from "lucide-react";

const bidsData = [
  { id: "B1", product: "Organic Wheat", farmer: "Rajesh Kumar", amount: "₹2,450/Quintal", previousBid: "₹2,400/Quintal", bidTime: "2 hours ago", auctionEnds: "2 days", status: "highest" },
  { id: "B2", product: "Premium Rice", farmer: "Anand Singh", amount: "₹3,650/Quintal", previousBid: "₹3,600/Quintal", bidTime: "5 hours ago", auctionEnds: "6 hours", status: "highest" },
  { id: "B3", product: "Yellow Lentils", farmer: "Suresh Verma", amount: "₹9,100/Quintal", previousBid: "₹9,000/Quintal", bidTime: "1 day ago", auctionEnds: "1 day", status: "outbid" },
  { id: "B4", product: "Basmati Rice", farmer: "Prakash Mehta", amount: "₹7,100/Quintal", previousBid: null, bidTime: "3 days ago", auctionEnds: "", status: "won" },
  { id: "B5", product: "Fresh Potatoes", farmer: "Meena Patel", amount: "₹2,000/Quintal", previousBid: "₹1,900/Quintal", bidTime: "4 days ago", auctionEnds: "", status: "lost" },
];

const TraderBids = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredBids = bidsData.filter(bid => {
    const matchesSearch = bid.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           bid.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "highest":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Highest Bid
          </Badge>
        );
      case "outbid":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Outbid
          </Badge>
        );
      case "won":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Gavel className="h-3 w-3 mr-1" />
            Won
          </Badge>
        );
      case "lost":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Lost
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Bids" userName="Vikram Sharma" />
      
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
          <CardDescription>Track all your bids on agricultural products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by product or farmer..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0 w-full md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bids</SelectItem>
                  <SelectItem value="highest">Highest Bids</SelectItem>
                  <SelectItem value="outbid">Outbid</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Bid Amount</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.length > 0 ? (
                  filteredBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium">{bid.product}</TableCell>
                      <TableCell>{bid.farmer}</TableCell>
                      <TableCell className="font-medium">
                        <div>{bid.amount}</div>
                        {bid.previousBid && (
                          <div className="text-xs text-green-600">
                            +{parseInt(bid.amount) - parseInt(bid.previousBid)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{bid.bidTime}</div>
                        {bid.auctionEnds && (
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Ends in {bid.auctionEnds}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(bid.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const route = bid.status === "won" || bid.status === "lost" 
                              ? `/trader-auctions/${bid.id}/result` 
                              : `/trader-auctions/${bid.id}`;
                            navigate(route);
                          }}
                        >
                          {bid.status === "highest" || bid.status === "outbid" ? (
                            <>
                              <Gavel className="h-4 w-4 mr-1" />
                              {bid.status === "outbid" ? "Rebid" : "View Auction"}
                            </>
                          ) : (
                            <>
                              <Package className="h-4 w-4 mr-1" />
                              {bid.status === "won" ? "Purchase" : "Details"}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center">
                        <Gavel className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-2">No bids found matching your criteria</p>
                        <Button onClick={() => navigate("/trader-auctions")}>
                          Browse Active Auctions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderBids;
