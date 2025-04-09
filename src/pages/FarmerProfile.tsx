
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, User, Farm, Building, Upload, FileCheck, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const FarmerProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmDetails, setFarmDetails] = useState({
    farmName: "",
    farmType: "",
    farmSize: "",
    farmSizeUnit: "acres",
    farmAddress: "",
    farmPhone: "",
    farmEmail: "",
    soilType: "",
    irrigationType: ""
  });
  const [businessDetails, setBusinessDetails] = useState({
    businessName: "",
    businessType: "",
    registrationNumber: "",
    gstNumber: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    businessWebsite: ""
  });
  const [documents, setDocuments] = useState([]);
  
  // Fetch profile details on component mount
  useEffect(() => {
    if (profile?.id) {
      fetchFarmDetails();
      fetchBusinessDetails();
      fetchDocuments();
      setLoading(false);
    }
  }, [profile?.id]);
  
  const fetchFarmDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_details')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setFarmDetails({
          farmName: data.farm_name || "",
          farmType: data.farm_type || "",
          farmSize: data.farm_size?.toString() || "",
          farmSizeUnit: data.farm_size_unit || "acres",
          farmAddress: data.farm_address || "",
          farmPhone: data.farm_phone || "",
          farmEmail: data.farm_email || "",
          soilType: data.soil_type || "",
          irrigationType: data.irrigation_type || ""
        });
      }
    } catch (error) {
      console.error('Error fetching farm details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch farm details.",
        variant: "destructive"
      });
    }
  };
  
  const fetchBusinessDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('business_details')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setBusinessDetails({
          businessName: data.business_name || "",
          businessType: data.business_type || "",
          registrationNumber: data.registration_number || "",
          gstNumber: data.gst_number || "",
          businessAddress: data.business_address || "",
          businessPhone: data.business_phone || "",
          businessEmail: data.business_email || "",
          businessWebsite: data.business_website || ""
        });
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business details.",
        variant: "destructive"
      });
    }
  };
  
  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };
  
  const handleFarmDetailsChange = (e) => {
    const { id, value } = e.target;
    setFarmDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleBusinessDetailsChange = (e) => {
    const { id, value } = e.target;
    setBusinessDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSaveFarmDetails = async () => {
    setSaving(true);
    
    try {
      // Validate farm size
      const farmSize = parseFloat(farmDetails.farmSize);
      if (isNaN(farmSize) || farmSize <= 0) {
        throw new Error("Farm size must be a positive number");
      }
      
      const farmData = {
        user_id: profile.id,
        farm_name: farmDetails.farmName,
        farm_type: farmDetails.farmType,
        farm_size: farmSize,
        farm_size_unit: farmDetails.farmSizeUnit,
        farm_address: farmDetails.farmAddress,
        farm_phone: farmDetails.farmPhone,
        farm_email: farmDetails.farmEmail,
        soil_type: farmDetails.soilType,
        irrigation_type: farmDetails.irrigationType
      };
      
      const { error } = await supabase
        .from('farm_details')
        .upsert(farmData, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      // Update profile with summary in farm_details field
      await updateProfile({
        farm_details: {
          name: farmDetails.farmName,
          type: farmDetails.farmType,
          size: farmSize,
          unit: farmDetails.farmSizeUnit
        }
      });
      
      toast({
        title: "Success",
        description: "Farm details updated successfully."
      });
    } catch (error) {
      console.error('Error saving farm details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save farm details.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveBusinessDetails = async () => {
    setSaving(true);
    
    try {
      const businessData = {
        user_id: profile.id,
        business_name: businessDetails.businessName,
        business_type: businessDetails.businessType,
        registration_number: businessDetails.registrationNumber,
        gst_number: businessDetails.gstNumber,
        business_address: businessDetails.businessAddress,
        business_phone: businessDetails.businessPhone,
        business_email: businessDetails.businessEmail,
        business_website: businessDetails.businessWebsite
      };
      
      const { error } = await supabase
        .from('business_details')
        .upsert(businessData, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      // Update profile with summary in business_details field
      await updateProfile({
        business_details: {
          name: businessDetails.businessName,
          type: businessDetails.businessType,
          registration: businessDetails.registrationNumber
        }
      });
      
      toast({
        title: "Success",
        description: "Business details updated successfully."
      });
    } catch (error) {
      console.error('Error saving business details:', error);
      toast({
        title: "Error",
        description: "Failed to save business details.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      // Save document reference to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: profile.id,
          title: file.name,
          document_type: 'verification', // Default type
          file_url: data.publicUrl,
          status: 'pending'
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Success",
        description: "Document uploaded successfully."
      });
      
      // Refresh documents list
      fetchDocuments();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userRole="farmer">
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Profile" userName={profile?.name || "Farmer"} userRole="farmer" />
      
      <Tabs defaultValue="farm" className="space-y-6">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex mb-6">
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="farm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Farm className="h-5 w-5" />
                Farm Details
              </CardTitle>
              <CardDescription>
                Provide details about your farm to help traders understand your production capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    value={farmDetails.farmName}
                    onChange={handleFarmDetailsChange}
                    placeholder="Enter your farm name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farmType">Farm Type</Label>
                  <Select
                    value={farmDetails.farmType}
                    onValueChange={(value) => setFarmDetails(prev => ({ ...prev, farmType: value }))}
                  >
                    <SelectTrigger id="farmType">
                      <SelectValue placeholder="Select farm type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organic">Organic</SelectItem>
                      <SelectItem value="Conventional">Conventional</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Sustainable">Sustainable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    value={farmDetails.farmSize}
                    onChange={handleFarmDetailsChange}
                    placeholder="Enter farm size"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farmSizeUnit">Unit</Label>
                  <Select
                    value={farmDetails.farmSizeUnit}
                    onValueChange={(value) => setFarmDetails(prev => ({ ...prev, farmSizeUnit: value }))}
                  >
                    <SelectTrigger id="farmSizeUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acres">Acres</SelectItem>
                      <SelectItem value="hectares">Hectares</SelectItem>
                      <SelectItem value="bigha">Bigha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select
                    value={farmDetails.soilType}
                    onValueChange={(value) => setFarmDetails(prev => ({ ...prev, soilType: value }))}
                  >
                    <SelectTrigger id="soilType">
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clay">Clay</SelectItem>
                      <SelectItem value="Sandy">Sandy</SelectItem>
                      <SelectItem value="Silt">Silt</SelectItem>
                      <SelectItem value="Loam">Loam</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="irrigationType">Irrigation Type</Label>
                <Select
                  value={farmDetails.irrigationType}
                  onValueChange={(value) => setFarmDetails(prev => ({ ...prev, irrigationType: value }))}
                >
                  <SelectTrigger id="irrigationType">
                    <SelectValue placeholder="Select irrigation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drip">Drip Irrigation</SelectItem>
                    <SelectItem value="Sprinkler">Sprinkler System</SelectItem>
                    <SelectItem value="Flood">Flood Irrigation</SelectItem>
                    <SelectItem value="Furrow">Furrow Irrigation</SelectItem>
                    <SelectItem value="Rain-fed">Rain-fed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="farmAddress" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Farm Address
                </Label>
                <Textarea
                  id="farmAddress"
                  value={farmDetails.farmAddress}
                  onChange={handleFarmDetailsChange}
                  placeholder="Enter complete farm address"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farmPhone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Farm Contact Number
                  </Label>
                  <Input
                    id="farmPhone"
                    value={farmDetails.farmPhone}
                    onChange={handleFarmDetailsChange}
                    placeholder="Enter farm contact number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farmEmail" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Farm Email
                  </Label>
                  <Input
                    id="farmEmail"
                    type="email"
                    value={farmDetails.farmEmail}
                    onChange={handleFarmDetailsChange}
                    placeholder="Enter farm email address"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveFarmDetails} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Farm Details
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Details
              </CardTitle>
              <CardDescription>
                Provide your business information for trading and invoicing purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessDetails.businessName}
                    onChange={handleBusinessDetailsChange}
                    placeholder="Enter your business name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={businessDetails.businessType}
                    onValueChange={(value) => setBusinessDetails(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                      <SelectItem value="Cooperative">Cooperative</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={businessDetails.registrationNumber}
                    onChange={handleBusinessDetailsChange}
                    placeholder="Enter business registration number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={businessDetails.gstNumber}
                    onChange={handleBusinessDetailsChange}
                    placeholder="Enter GST number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={businessDetails.businessAddress}
                  onChange={handleBusinessDetailsChange}
                  placeholder="Enter complete business address"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={businessDetails.businessPhone}
                    onChange={handleBusinessDetailsChange}
                    placeholder="Enter business phone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessDetails.businessEmail}
                    onChange={handleBusinessDetailsChange}
                    placeholder="Enter business email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessWebsite">Business Website</Label>
                  <Input
                    id="businessWebsite"
                    value={businessDetails.businessWebsite}
                    onChange={handleBusinessDetailsChange}
                    placeholder="Enter business website URL"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBusinessDetails} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Business Details
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Documents & Verification
              </CardTitle>
              <CardDescription>
                Upload important documents for verification and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md p-8">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Upload documents such as ID proof, address proof, or farm certifications
                </p>
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleUploadDocument}
                  />
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Uploaded Documents</h3>
                {documents.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-3">Document Name</th>
                          <th className="text-left p-3">Type</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Uploaded On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-t">
                            <td className="p-3">
                              <a 
                                href={doc.file_url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {doc.title}
                              </a>
                            </td>
                            <td className="p-3">{doc.document_type}</td>
                            <td className="p-3">
                              <Badge
                                variant={
                                  doc.status === 'verified' ? 'default' :
                                  doc.status === 'pending' ? 'outline' :
                                  'destructive'
                                }
                              >
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded-md text-muted-foreground">
                    No documents uploaded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default FarmerProfile;
