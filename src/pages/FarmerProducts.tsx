import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Search, Pencil, Trash, Gavel, Eye, Edit, Trash2, PackageX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  price: number;
  location: string;
  auction_id?: string;
}

const FarmerProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles:farmer_id (
              id,
              name,
              role
            )
          `)
          .eq('farmer_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        console.log('Raw data from database:', data);
        
        // Transform the data to ensure price and quantity are numbers
        const transformedData = (data || []).map(product => {
          console.log('Raw product:', product);
          console.log('Raw product price:', product.price, 'Type:', typeof product.price);
          const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0;
          const quantity = typeof product.quantity === 'string' ? parseFloat(product.quantity) : Number(product.quantity) || 0;
          
          console.log('Parsed price:', price, 'Type:', typeof price);
          
          const transformed = {
            ...product,
            price,
            quantity
          };
          return transformed;
        });
        
        console.log('Transformed data:', transformedData);
        
        setProducts(transformedData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [profile?.id, toast]);
  
  const handleDeleteProduct = async (productId: string) => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('farmer_id', profile?.id);
        
      if (error) throw error;
      
      // Update local state
      setProducts(products.filter(product => product.id !== productId));
      
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the product",
        variant: "destructive"
      });
    }
  };

  const handleCreateAuction = (productId: string) => {
    navigate(`/farmer-auctions/create?product=${productId}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <DashboardLayout userRole="farmer">
      <div className="h-full p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Inventory</h1>
            <p className="text-muted-foreground">Manage your agricultural products</p>
          </div>
          <Button 
            onClick={() => navigate("/farmer-products/add")}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Product
          </Button>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, category, or location..."
              className="pl-9 h-12 text-base bg-white shadow-sm hover:shadow transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0 w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 text-base bg-white shadow-sm hover:shadow transition-all duration-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="active">Active Listings</SelectItem>
                <SelectItem value="auction">In Auction</SelectItem>
                <SelectItem value="sold">Sold Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold text-right">Quantity</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Price</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Package className="h-6 w-6 animate-pulse text-muted-foreground" />
                      <span className="text-muted-foreground">Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <PackageX className="h-8 w-8 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">No products found</span>
                      <Button
                        variant="link"
                        onClick={() => navigate("/farmer-products/add")}
                        className="text-green-600 hover:text-green-700"
                      >
                        Add your first product
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="hover:bg-gray-50/90 transition-all duration-200 group"
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.quantity} {product.unit}</TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          product.status === "active" ? "default" :
                          product.status === "auction" ? "secondary" :
                          "outline"
                        }
                        className="font-medium capitalize"
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.price || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/farmer-products/${product.id}`)}
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/farmer-products/${product.id}/edit`)}
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCreateAuction(product.id)}
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100"
                          title="Create Auction"
                        >
                          <Gavel className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerProducts;
