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
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

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

interface ExtendedProfileData {
  id: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  email?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface BusinessDetails {
  id?: string;
  user_id: string;
  business_name: string;
  business_type: string;
  business_email?: string;
  business_phone?: string;
  business_website?: string;
  business_address: string;
  gst_number?: string;
  registration_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface ExtendedBusinessData {
  designation: string;
  description: string;
  areas: string;
}

const TraderProfile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfileData | null>(null);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [extendedBusinessData, setExtendedBusinessData] = useState<ExtendedBusinessData>({
    designation: 'Director of Procurement',
    description: '',
    areas: ''
  });
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBio, setProfileBio] = useState("");
  
  const personalForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      bio: ''
    }
  });
  
  const companyForm = useForm<CompanyFormData>({
    defaultValues: {
      companyName: '',
      designation: 'Director of Procurement',
      gstin: '',
      tradeLicense: '',
      companyAddress: '',
      businessDescription: '',
      operationalAreas: ''
    }
  });
  
  const setPersonalValue = personalForm.setValue;
  const setCompanyValue = companyForm.setValue;
  
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

      // Set the extended profile with default empty bio
      setExtendedProfile({
        ...profileData,
        bio: ""
      });
      
      // Fetch bio from another function or table if needed
      try {
        const { data: extendedData, error: extendedError } = await supabase
          .rpc('get_trader_bio', { user_id: profile?.id });
        
        if (!extendedError && extendedData) {
          setProfileBio(extendedData || "");
        }
      } catch (bioError) {
        console.error('Bio data not available:', bioError);
        setProfileBio("");
      }
      
      // Populate personal form data
      const nameParts = profileData.name?.split(' ') || ['', ''];
      setPersonalValue('firstName', nameParts[0] || '');
      setPersonalValue('lastName', nameParts.slice(1).join(' ') || '');
      setPersonalValue('phone', profileData.phone || '');
      setPersonalValue('address', profileData.address || '');
      setPersonalValue('bio', profileBio || '');
      
      // Fetch user email from auth.users
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (userData?.user?.email) {
        setProfileEmail(userData.user.email);
        setPersonalValue('email', userData.user.email);
      }
      
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('business_details')
        .select('*')
        .eq('user_id', profile?.id)
        .single();
      
      if (!businessError && businessData) {
        setBusinessDetails(businessData);
        
        // Get additional business fields if available
        try {
          const { data: extBizData, error: extBusinessError } = await supabase
            .rpc('get_business_extended_data', { b_id: businessData.id });
            
          if (!extBusinessError && extBizData) {
            // Store extended fields
            const extendedData: ExtendedBusinessData = {
              designation: extBizData.designation || 'Director of Procurement',
              description: extBizData.description || '',
              areas: extBizData.areas || ''
            };
            setExtendedBusinessData(extendedData);
            
            // Populate business form with both standard and extended data
            setCompanyValue('companyName', businessData.business_name || '');
            setCompanyValue('designation', extendedData.designation);
            setCompanyValue('gstin', businessData.gst_number || '');
            setCompanyValue('tradeLicense', businessData.registration_number || '');
            setCompanyValue('companyAddress', businessData.business_address || '');
            setCompanyValue('businessDescription', extendedData.description);
            setCompanyValue('operationalAreas', extendedData.areas);
          } else {
            // Use default values if extended data not available
            const defaultExtendedData: ExtendedBusinessData = {
              designation: 'Director of Procurement',
              description: '',
              areas: ''
            };
            setExtendedBusinessData(defaultExtendedData);
            
            setCompanyValue('companyName', businessData.business_name || '');
            setCompanyValue('designation', defaultExtendedData.designation);
            setCompanyValue('gstin', businessData.gst_number || '');
            setCompanyValue('tradeLicense', businessData.registration_number || '');
            setCompanyValue('companyAddress', businessData.business_address || '');
            setCompanyValue('businessDescription', defaultExtendedData.description);
            setCompanyValue('operationalAreas', defaultExtendedData.areas);
          }
        } catch (extError) {
          console.error('Error fetching extended business data:', extError);
          
          // Default values if extended business data fails
          const fallbackExtendedData: ExtendedBusinessData = {
            designation: 'Director of Procurement',
            description: '',
            areas: ''
          };
          setExtendedBusinessData(fallbackExtendedData);
          
          setCompanyValue('companyName', businessData.business_name || '');
          setCompanyValue('designation', fallbackExtendedData.designation);
          setCompanyValue('gstin', businessData.gst_number || '');
          setCompanyValue('tradeLicense', businessData.registration_number || '');
          setCompanyValue('companyAddress', businessData.business_address || '');
          setCompanyValue('businessDescription', fallbackExtendedData.description);
          setCompanyValue('operationalAreas', fallbackExtendedData.areas);
        }
      } else {
        // Set defaults for new business
        setBusinessDetails(null);
        const defaultNewBusinessData: ExtendedBusinessData = {
          designation: 'Director of Procurement',
          description: '',
          areas: ''
        };
        setExtendedBusinessData(defaultNewBusinessData);
        
        setCompanyValue('companyName', '');
        setCompanyValue('designation', defaultNewBusinessData.designation);
        setCompanyValue('gstin', '');
        setCompanyValue('tradeLicense', '');
        setCompanyValue('companyAddress', '');
        setCompanyValue('businessDescription', '');
        setCompanyValue('operationalAreas', '');
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
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update bio in a separate table or via RPC function if available
      try {
        await supabase.rpc('update_trader_bio', { 
          user_id: profile.id, 
          bio_text: data.bio 
        });
        setProfileBio(data.bio);
      } catch (bioError) {
        console.error('Error updating bio:', bioError);
        // Create a function to handle bio if it doesn't exist
      }
      
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
      const businessData: BusinessDetails = {
        user_id: profile.id,
        business_name: data.companyName,
        business_type: 'Trading',
        business_address: data.companyAddress,
        gst_number: data.gstin,
        registration_number: data.tradeLicense,
        updated_at: new Date().toISOString()
      };
      
      if (businessDetails?.id) {
        // Update existing business details
        const { error } = await supabase
          .from('business_details')
          .update({
            business_name: data.companyName,
            business_type: 'Trading',
            business_address: data.companyAddress,
            gst_number: data.gstin,
            registration_number: data.tradeLicense,
            updated_at: new Date().toISOString()
          })
          .eq('id', businessDetails.id);
        
        if (error) throw error;
        
        // Update additional fields via RPC function if available
        try {
          await supabase.rpc('update_business_extended_data', { 
            business_id: businessDetails.id, 
            designation_text: data.designation,
            description_text: data.businessDescription,
            areas_text: data.operationalAreas
          });
          
          // Update local state
          setExtendedBusinessData({
            designation: data.designation,
            description: data.businessDescription,
            areas: data.operationalAreas
          });
        } catch (extError) {
          console.error('Error updating extended business data:', extError);
          // Create a function to handle extended data if it doesn't exist
        }
      } else {
        // Create new business details
        const { data: newBusiness, error } = await supabase
          .from('business_details')
          .insert({
            user_id: profile.id,
            business_name: data.companyName,
            business_type: 'Trading',
            business_address: data.companyAddress,
            gst_number: data.gstin,
            registration_number: data.tradeLicense
          })
          .select();
        
        if (error) throw error;
        
        if (newBusiness && newBusiness.length > 0) {
          // Set the new business details locally
          setBusinessDetails(newBusiness[0]);
          
          // Update extended data if function exists
          try {
            await supabase.rpc('update_business_extended_data', { 
              business_id: newBusiness[0].id, 
              designation_text: data.designation,
              description_text: data.businessDescription,
              areas_text: data.operationalAreas
            });
            
            // Update local state
            setExtendedBusinessData({
              designation: data.designation,
              description: data.businessDescription,
              areas: data.operationalAreas
            });
          } catch (extError) {
            console.error('Extended business data function not available:', extError);
            // Create a function to handle extended data if it doesn't exist
          }
        }
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
                  <span>{profileEmail || "Not specified"}</span>
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
                  <form className="space-y-6" onSubmit={personalForm.handleSubmit(onPersonalSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          {...personalForm.register('firstName', { required: true })} 
                        />
                        {personalForm.formState.errors.firstName && <p className="text-sm text-red-500">First name is required</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          {...personalForm.register('lastName')} 
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
                          {...personalForm.register('email')} 
                        />
                        <p className="text-xs text-muted-foreground">Contact support to change email</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          {...personalForm.register('phone')} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Residential Address</Label>
                      <Textarea 
                        id="address" 
                        {...personalForm.register('address')} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        {...personalForm.register('bio')} 
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
                  <form className="space-y-6" onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          {...companyForm.register('companyName', { required: true })} 
                        />
                        {companyForm.formState.errors.companyName && <p className="text-sm text-red-500">Company name is required</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Your Designation</Label>
                        <Input 
                          id="designation" 
                          {...companyForm.register('designation')} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN Number</Label>
                        <Input 
                          id="gstin" 
                          {...companyForm.register('gstin')} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tradeLicense">Trade License Number</Label>
                        <Input 
                          id="tradeLicense" 
                          {...companyForm.register('tradeLicense')} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Company Address</Label>
                      <Textarea 
                        id="companyAddress" 
                        {...companyForm.register('companyAddress')} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">Business Description</Label>
                      <Textarea 
                        id="businessDescription" 
                        {...companyForm.register('businessDescription')} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="operationalAreas">Operational Areas</Label>
                      <Input 
                        id="operationalAreas" 
                        {...companyForm.register('operationalAreas')} 
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
