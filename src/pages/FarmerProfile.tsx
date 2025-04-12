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
import { Tractor, User, MapPin, Phone, Mail, Building, Crop, Droplets, Ruler, Loader2, FileCheck, Upload, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PersonalDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

interface FarmDetails {
  farmName: string;
  farmType: string;
  farmSize: string;
  farmSizeUnit: string;
  farmAddress: string;
  soilType: string;
  irrigationType: string;
}

interface BusinessDetails {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  gstNumber: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
}

const FarmerProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: ""
  });
  const [farmDetails, setFarmDetails] = useState<FarmDetails>({
    farmName: "",
    farmType: "",
    farmSize: "",
    farmSizeUnit: "acres",
    farmAddress: "",
    soilType: "",
    irrigationType: ""
  });
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
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
  
  useEffect(() => {
    if (profile?.id) {
      fetchFarmDetails();
      fetchBusinessDetails();
      fetchDocuments();
      setPersonalDetails({
        firstName: profile.name?.split(' ')[0] || '',
        lastName: profile.name?.split(' ')[1] || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || ''
      });
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
  
  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPersonalDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSavePersonalDetails = async () => {
    setSaving(true);
    try {
      const fullName = `${personalDetails.firstName} ${personalDetails.lastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          phone: personalDetails.phone,
          email: personalDetails.email,
          address: personalDetails.address
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      await updateProfile({
        ...profile,
        name: fullName,
        phone: personalDetails.phone,
        email: personalDetails.email,
        address: personalDetails.address
      });
      
      toast({
        title: "Success",
        description: "Personal details updated successfully."
      });
    } catch (error) {
      console.error('Error saving personal details:', error);
      toast({
        title: "Error",
        description: "Failed to save personal details.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveFarmDetails = async () => {
    setSaving(true);
    
    try {
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
        soil_type: farmDetails.soilType,
        irrigation_type: farmDetails.irrigationType
      };
      
      const { error } = await supabase
        .from('farm_details')
        .upsert(farmData, { onConflict: 'user_id' });
      
      if (error) throw error;
      
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: profile.id,
          title: file.name,
          document_type: 'verification',
          file_url: data.publicUrl,
          status: 'pending'
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Success",
        description: "Document uploaded successfully."
      });
      
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
      
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex mb-6">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
              <CardDescription>
                Provide your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={personalDetails.firstName}
                    onChange={handlePersonalDetailsChange}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={personalDetails.lastName}
                    onChange={handlePersonalDetailsChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalDetails.phone}
                    onChange={handlePersonalDetailsChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalDetails.email}
                    disabled
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-muted-foreground">Contact support to change email</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={personalDetails.address}
                  onChange={handlePersonalDetailsChange}
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePersonalDetails} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Personal Details
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="farm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tractor className="h-5 w-5" />
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
      </Tabs>
    </DashboardLayout>
  );
};

export default FarmerProfile;
