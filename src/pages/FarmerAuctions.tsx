
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
import { Gavel, Plus, Search, ArrowUpRight, Calendar, Eye, Ban } from "lucide-react";

const auctionData = [
  { id: "A1", product: "Organic Wheat", quantity: "20 Quintals", startingPrice: "₹2,200/Quintal", currentBid: "₹2,450/Quintal", bidCount: 5, endsIn: "2 days", status: "active" },
  { id: "A2", product: "Premium Rice", quantity: "15 Quintals", startingPrice: "₹3,500/Quintal", currentBid: "₹3,650/Quintal", bidCount: 3, endsIn: "6 hours", status: "active" },
  { id: "A3", product: "Yellow Lentils", quantity: "10 Quintals", startingPrice: "₹9,000/Quintal", currentBid: "₹9,200/Quintal", bidCount: 2, endsIn: "1 day", status: "active" },
  { id: "A4", product: "Red Chillies", quantity: "5 Quintals", startingPrice: "₹12,000/Quintal", currentBid: "₹12,000/Quintal", bidCount: 0, endsIn: "3 days", status: "active" },
  { id: "A5", product: "Basmati Rice", quantity: "12 Quintals", startingPrice: "₹6,500/Quintal", currentBid: "₹7,200/Quintal", bidCount: 8, endsIn: "", status: "completed" },
  { id: "A6", product: "Fresh Potatoes", quantity: "25 Quintals", startingPrice: "₹1,800/Quintal", currentBid: "₹2,100/Quintal", bidCount: 6, endsIn: "", status: "completed" },
];

const FarmerAuctions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredAuctions = auctionData.filter(auction => {
    const matchesSearch = auction.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || auction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Auctions" userName="Rajesh Kumar" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Auction Management</CardTitle>
            <CardDescription>Create and manage your product auctions</CardDescription>
          </div>
          <Button 
            onClick={() => navigate("/farmer-auctions/create")}
            className="mt-4 sm:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Auction
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search auctions..."
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
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuctions.length > 0 ? (
                  filteredAuctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium">{auction.product}</TableCell>
                      <TableCell>{auction.quantity}</TableCell>
                      <TableCell>{auction.startingPrice}</TableCell>
                      <TableCell className="font-medium">{auction.currentBid}</TableCell>
                      <TableCell>{auction.bidCount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            auction.status === "completed" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {auction.status === "active" ? (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{auction.endsIn}</span>
                            </div>
                          ) : (
                            "Completed"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/farmer-auctions/${auction.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {auction.status === "active" && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/farmer-auctions/${auction.id}/edit`)}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center">
                        <Gavel className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-2">No auctions found matching your criteria</p>
                        <Button onClick={() => navigate("/farmer-auctions/create")}>
                          Create New Auction
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

export default FarmerAuctions;
