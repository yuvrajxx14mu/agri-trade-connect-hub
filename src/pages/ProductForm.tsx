
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  
  // Initial form data - in edit mode, we would fetch the product data
  const [formData, setFormData] = useState({
    name: isEditMode ? "Organic Wheat" : "",
    description: isEditMode ? "High-quality organic wheat grown without pesticides." : "",
    category: isEditMode ? "Cereals" : "",
    quantity: isEditMode ? "20" : "",
    unit: isEditMode ? "Quintals" : "Quintals",
    price: isEditMode ? "2200" : "",
    location: isEditMode ? "Amritsar, Punjab" : "",
    harvestDate: isEditMode ? "2025-03-15" : "",
    shelfLife: isEditMode ? "12" : "",
    specifications: isEditMode ? [
      { label: "Type", value: "Organic" },
      { label: "Variety", value: "HD-2967" },
      { label: "Moisture", value: "12%" },
    ] : []
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would call API here
    toast({
      title: isEditMode ? "Product Updated" : "Product Created",
      description: `${formData.name} has been ${isEditMode ? "updated" : "added"} successfully.`,
    });
    
    navigate("/farmer-products");
  };
  
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
          userName="Rajesh Kumar" 
        />
      </div>
      
      <Card>
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
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input 
                  id="harvestDate" 
                  name="harvestDate" 
                  type="date"
                  value={formData.harvestDate} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shelfLife">Shelf Life (months) *</Label>
                <Input 
                  id="shelfLife" 
                  name="shelfLife" 
                  type="number"
                  value={formData.shelfLife} 
                  onChange={handleInputChange}
                  placeholder="Enter shelf life" 
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate("/farmer-products")}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? "Update Product" : "Save Product"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default ProductForm;
