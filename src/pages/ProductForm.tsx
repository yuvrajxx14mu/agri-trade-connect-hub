import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  description: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
  location: string;
  quality: string;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    quantity: "",
    unit: "Quintals",
    price: "",
    location: "",
    quality: "Standard"
  });
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditMode || !profile?.id) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('farmer_id', profile.id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          navigate('/farmer-products');
          return;
        }
        
        setFormData({
          name: data.name,
          description: data.description || "",
          category: data.category,
          quantity: data.quantity.toString(),
          unit: data.unit,
          price: data.price.toString(),
          location: data.location,
          quality: data.quality
        });
        
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Could not load product data",
          variant: "destructive"
        });
        navigate('/farmer-products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, isEditMode, profile?.id, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.price),
        location: formData.location,
        quality: formData.quality,
        status: "active",
        farmer_id: profile.id,
        farmer_name: profile.name
      };
      
      if (isEditMode) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id)
          .eq('farmer_id', profile.id);
          
        if (error) throw error;
        
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
          
        if (error) throw error;
        
        toast({
          title: "Product Created",
          description: `${formData.name} has been added to your inventory.`,
        });
      }
      
      navigate("/farmer-products");
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} product`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userRole="farmer">
        <div className="flex justify-center items-center h-[80vh]">
          <p>Loading product data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="farmer">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/farmer-products")} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        
        <DashboardHeader 
          title={isEditMode ? "Edit Product" : "Add New Product"} 
          userName={profile?.name || "User"}
          userRole="farmer"
        />
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Product Details" : "Product Details"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update your product information with accurate details"
              : "Add a new product to your inventory with detailed information"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  placeholder="Enter product name" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cereals">Cereals</SelectItem>
                    <SelectItem value="Pulses">Pulses</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Spices">Spices</SelectItem>
                    <SelectItem value="Oilseeds">Oilseeds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                placeholder="Provide a detailed description of your product"
                className="min-h-28"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number"
                  value={formData.quantity} 
                  onChange={handleInputChange}
                  placeholder="Enter quantity" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => handleSelectChange("unit", value)}
                  required
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kilograms">Kilograms</SelectItem>
                    <SelectItem value="Quintals">Quintals</SelectItem>
                    <SelectItem value="Tonnes">Tonnes</SelectItem>
                    <SelectItem value="Pieces">Pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price per {formData.unit} (₹) *</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number"
                  value={formData.price} 
                  onChange={handleInputChange}
                  placeholder="Enter price" 
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange}
                  placeholder="Enter location" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quality">Quality *</Label>
                <Select 
                  value={formData.quality} 
                  onValueChange={(value) => handleSelectChange("quality", value)}
                  required
                >
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Economy">Economy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate("/farmer-products")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Product" : "Save Product"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default ProductForm;
