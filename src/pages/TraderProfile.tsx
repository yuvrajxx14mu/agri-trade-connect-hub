
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, MapPin, Phone, Mail, Shield, Bell, Key, Upload, Calendar, Building2, Loader2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

interface CompanyFormData {
  companyName: string;
  designation: string;
  gstin: string;
  tradeLicense: string;
  companyAddress: string;
  businessDescription: string;
  operationalAreas: string;
}

const TraderProfile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  
  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    setValue: setPersonalValue,
    formState: { errors: personalErrors }
  } = useForm<ProfileFormData>();
  
  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    setValue: setCompanyValue,
    formState: { errors: companyErrors }
  } = useForm<CompanyFormData>();
  
  useEffect(() => {
    if (profile?.id) {
      fetchProfileData();
    }
  }, [profile?.id]);
  
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch trader's detailed profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile?.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Populate personal form data
      const nameParts = profileData.name?.split(' ') || ['', ''];
      setPersonalValue('firstName', nameParts[0]);
      setPersonalValue('lastName', nameParts.slice(1).join(' '));
      setPersonalValue('phone', profileData.phone || '');
      setPersonalValue('address', profileData.address || '');
      
      // Fetch user email from auth.users
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      setPersonalValue('email', userData.user?.email || '');
      // For bio, we might store it separately or in the profiles table
      setPersonalValue('bio', profileData.bio || '');
      
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('business_details')
        .select('*')
        .eq('user_id', profile?.id)
        .single();
      
      if (!businessError && businessData) {
        setBusinessDetails(businessData);
        
        // Populate business form data
        setCompanyValue('companyName', businessData.business_name || '');
        setCompanyValue('designation', businessData.designation || 'Director of Procurement');
        setCompanyValue('gstin', businessData.gst_number || '');
        setCompanyValue('tradeLicense', businessData.registration_number || '');
        setCompanyValue('companyAddress', businessData.business_address || '');
        setCompanyValue('businessDescription', businessData.business_description || '');
        setCompanyValue('operationalAreas', businessData.operational_areas || '');
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onPersonalSubmit = async (data: ProfileFormData) => {
    if (!profile?.id) return;
    
    setSavingPersonal(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          phone: data.phone,
          address: data.address,
          bio: data.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local auth context
      updateProfile({
        ...profile,
        name: fullName,
        phone: data.phone
      });
      
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive"
      });
    } finally {
      setSavingPersonal(false);
    }
  };
  
  const onCompanySubmit = async (data: CompanyFormData) => {
    if (!profile?.id) return;
    
    setSavingCompany(true);
    try {
      const businessData = {
        user_id: profile.id,
        business_name: data.companyName,
        designation: data.designation,
        gst_number: data.gstin,
        registration_number: data.tradeLicense,
        business_address: data.companyAddress,
        business_description: data.businessDescription,
        operational_areas: data.operationalAreas,
        updated_at: new Date().toISOString()
      };
      
      if (businessDetails) {
        // Update existing business details
        const { error } = await supabase
          .from('business_details')
          .update(businessData)
          .eq('id', businessDetails.id);
        
        if (error) throw error;
      } else {
        // Create new business details
        const { error } = await supabase
          .from('business_details')
          .insert(businessData);
        
        if (error) throw error;
        
        // Refresh business details
        const { data } = await supabase
          .from('business_details')
          .select('*')
          .eq('user_id', profile.id)
          .single();
        
        setBusinessDetails(data);
      }
      
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    } catch (error) {
      console.error('Error updating business details:', error);
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive"
      });
    } finally {
      setSavingCompany(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userRole="trader">
        <DashboardHeader title="My Profile" userName={profile?.name || "User"} userRole="trader" />
        <div className="flex justify-center items-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Profile" userName={profile?.name || "User"} userRole="trader" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mt-2 mb-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt={profile?.name || "User"} />
                  <AvatarFallback>
                    {profile?.name?.split(' ').map((n) => n[0]).join('') || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{profile?.name}</h2>
              <p className="text-sm text-muted-foreground mb-1">Agricultural Trader</p>
              <Badge variant="outline" className="bg-agri-trader/10 text-agri-trader mb-4">Verified Trader</Badge>
              
              <div className="w-full space-y-3 mt-2">
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{businessDetails?.business_name || "Not specified"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.address || "Not specified"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.phone || "Not specified"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.email || "Not specified"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}</span>
                </div>
              </div>
              
              <div className="w-full mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">Achievements</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Top Buyer</Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">50+ Trades</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Premium Partner</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="profile">Personal Info</TabsTrigger>
              <TabsTrigger value="company">Company Details</TabsTrigger>
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmitPersonal(onPersonalSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          {...registerPersonal('firstName', { required: true })} 
                        />
                        {personalErrors.firstName && <p className="text-sm text-red-500">First name is required</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          {...registerPersonal('lastName')} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          disabled
                          {...registerPersonal('email')} 
                        />
                        <p className="text-xs text-muted-foreground">Contact support to change email</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          {...registerPersonal('phone')} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Residential Address</Label>
                      <Textarea 
                        id="address" 
                        {...registerPersonal('address')} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        {...registerPersonal('bio')} 
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-agri-trader"
                        disabled={savingPersonal}
                      >
                        {savingPersonal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Information about your trading business</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmitCompany(onCompanySubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          {...registerCompany('companyName', { required: true })} 
                        />
                        {companyErrors.companyName && <p className="text-sm text-red-500">Company name is required</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Your Designation</Label>
                        <Input 
                          id="designation" 
                          {...registerCompany('designation')} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN Number</Label>
                        <Input 
                          id="gstin" 
                          {...registerCompany('gstin')} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tradeLicense">Trade License Number</Label>
                        <Input 
                          id="tradeLicense" 
                          {...registerCompany('tradeLicense')} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Company Address</Label>
                      <Textarea 
                        id="companyAddress" 
                        {...registerCompany('companyAddress')} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">Business Description</Label>
                      <Textarea 
                        id="businessDescription" 
                        {...registerCompany('businessDescription')} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="operationalAreas">Operational Areas</Label>
                      <Input 
                        id="operationalAreas" 
                        {...registerCompany('operationalAreas')} 
                        placeholder="e.g. Maharashtra, Gujarat, Punjab" 
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-agri-trader"
                        disabled={savingCompany}
                      >
                        {savingCompany ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Company Information
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm">
                      You can manage detailed notification settings in the <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/settings')}>Settings page</Button>.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive email updates about your account activity</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive real-time updates within the application</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Account Security
                    </CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/change-password')}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderProfile;
