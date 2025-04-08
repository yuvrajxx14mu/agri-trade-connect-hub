import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Search, Pencil, Trash, Gavel, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const products = [
  { id: "P1", name: "Organic Wheat", category: "Cereals", quantity: "20 Quintals", status: "Listed", price: "₹2,200/Quintal", location: "Amritsar" },
  { id: "P2", name: "Premium Rice", category: "Cereals", quantity: "15 Quintals", status: "In Auction", price: "₹3,500/Quintal", location: "Karnal" },
  { id: "P3", name: "Yellow Lentils", category: "Pulses", quantity: "10 Quintals", status: "Sold", price: "₹9,000/Quintal", location: "Indore" },
  { id: "P4", name: "Red Chillies", category: "Spices", quantity: "5 Quintals", status: "Listed", price: "₹12,000/Quintal", location: "Guntur" },
  { id: "P5", name: "Fresh Potatoes", category: "Vegetables", quantity: "25 Quintals", status: "Sold", price: "₹1,800/Quintal", location: "Agra" },
  { id: "P6", name: "Basmati Rice", category: "Cereals", quantity: "12 Quintals", status: "Listed", price: "₹6,500/Quintal", location: "Dehradun" },
];

const FarmerProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const handleDeleteProduct = (productId: string) => {
    // TODO: Implement delete functionality with confirmation
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Here you would typically make an API call to delete the product
      console.log("Deleting product:", productId);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Products" userName="Rajesh Kumar" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Manage your agricultural products</CardDescription>
          </div>
          <Button 
            onClick={() => navigate("/farmer-products/add")}
            className="mt-4 sm:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
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
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="in auction">In Auction</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            product.status === "Sold" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : product.status === "In Auction" 
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/farmer-products/${product.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/farmer-products/${product.id}/edit`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {product.status === "Listed" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => navigate(`/farmer-products/${product.id}/auction`)}
                              className="hover:bg-blue-50"
                            >
                              <Gavel className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No products found matching your criteria</p>
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

export default FarmerProducts;
