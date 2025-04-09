import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import { User, MapPin, Phone, Mail, Shield, Bell, Key, Upload, Calendar } from "lucide-react";

interface NotificationSettings {
  email: {
    orders: boolean;
    shipments: boolean;
    bids: boolean;
    appointments: boolean;
    pricingAlerts: boolean;
    promotions: boolean;
  };
  push: {
    orders: boolean;
    shipments: boolean;
    bids: boolean;
    appointments: boolean;
    pricingAlerts: boolean;
    promotions: boolean;
  };
}

const FarmerProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });
  const [farmInfo, setFarmInfo] = useState({
    farmName: "",
    farmSize: "",
    primaryCrops: "",
    farmDescription: "",
    certifications: ""
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      orders: true,
      shipments: true,
      bids: true,
      appointments: true,
      pricingAlerts: true,
      promotions: false
    },
    push: {
      orders: true,
      shipments: true,
      bids: true,
      appointments: true,
      pricingAlerts: true,
      promotions: false
    }
  });
  const [userSettings, setUserSettings] = useState<NotificationSettings>({
    email: {
      orders: true,
      shipments: true,
      bids: true,
      appointments: true,
      pricingAlerts: true,
      promotions: false
    },
    push: {
      orders: true,
      shipments: true,
      bids: true,
      appointments: true,
      pricingAlerts: true,
      promotions: false
    }
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('settings')
          .eq('user_id', profile.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('notification_settings')
              .insert({
                user_id: profile.id,
                settings: notificationSettings
              });
            
            if (insertError) throw insertError;
          } else {
            throw error;
          }
        } else if (data) {
          setNotificationSettings(data.settings);
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err);
      }
    };
    
    fetchNotificationSettings();
  }, [profile?.id]);
  
  useEffect(() => {
    if (profile) {
      const nameParts = profile.name.split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ') || "";
      
      setPersonalInfo({
        firstName,
        lastName,
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || ""
      });
      
      const farmDetails = profile.farm_details;
      if (farmDetails) {
        setFarmInfo({
          farmName: farmDetails.farm_name || "",
          farmSize: farmDetails.farm_size?.toString() || "",
          primaryCrops: farmDetails.primary_crops || "",
          farmDescription: farmDetails.description || "",
          certifications: farmDetails.certifications || ""
        });
      }
    }
  }, [profile]);
  
  const handleUpdatePersonalInfo = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    try {
      const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
      
      const { error } = await updateProfile({
        name: fullName,
        phone: personalInfo.phone,
        address: personalInfo.address
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Personal information updated successfully",
        variant: "default"
      });
    } catch (err) {
      console.error('Error updating personal info:', err);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateFarm = async (farmData) => {
    try {
      const updates = {
        farm_details: farmData
      };
      
      const { error } = await updateProfile(updates);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Farm details updated successfully",
        variant: "default"
      });
      
      setIsEditingFarm(false);
    } catch (err) {
      console.error('Error updating farm details:', err);
      toast({
        title: "Error",
        description: "Failed to update farm details",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateNotificationSettings = async (type: keyof NotificationSettings, setting: string, value: boolean) => {
    if (!profile?.id) return;
    
    try {
      const updatedSettings = {
        ...notificationSettings,
        [type]: {
          ...notificationSettings[type],
          [setting]: value
        }
      };
      
      setNotificationSettings(updatedSettings);
      
      const { error } = await supabase
        .from('notification_settings')
        .update({
          settings: updatedSettings
        })
        .eq('user_id', profile.id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error updating notification settings:', err);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveNotificationSettings = async (settings) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: profile.id,
          settings: JSON.stringify(settings)
        });
      
      if (error) throw error;
      
      setUserSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated.",
        variant: "default"
      });
    } catch (err) {
      console.error('Error updating notification settings:', err);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Profile" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mt-2 mb-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || "User"}`} alt={profile?.name || "User"} />
                  <AvatarFallback>{profile?.name?.split(' ').map(n => n[0]).join('') || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{profile?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground mb-1">Organic Wheat Farmer</p>
              <Badge variant="outline" className="bg-agri-farmer/10 text-agri-farmer mb-4">Verified Farmer</Badge>
              
              <div className="w-full space-y-3 mt-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.address || profile?.city || "No address provided"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.phone || "No phone number provided"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.email || "No email provided"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}</span>
                </div>
              </div>
              
              <div className="w-full mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.farm_details?.certifications ? (
                    profile.farm_details.certifications.split(',').map((cert, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {cert.trim()}
                      </Badge>
                    ))
                  ) : (
                    <>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Organic Certified</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Quality Assured</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="profile">Personal Info</TabsTrigger>
              <TabsTrigger value="farm">Farm Details</TabsTrigger>
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
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleUpdatePersonalInfo(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={personalInfo.firstName}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={personalInfo.lastName}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea 
                        id="address" 
                        value={personalInfo.address}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="farm">
              <Card>
                <CardHeader>
                  <CardTitle>Farm Details</CardTitle>
                  <CardDescription>Information about your agricultural operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleUpdateFarm(farmInfo); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input 
                          id="farmName" 
                          value={farmInfo.farmName}
                          onChange={(e) => setFarmInfo(prev => ({ ...prev, farmName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmSize">Farm Size (Acres)</Label>
                        <Input 
                          id="farmSize" 
                          type="number"
                          value={farmInfo.farmSize}
                          onChange={(e) => setFarmInfo(prev => ({ ...prev, farmSize: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="primaryCrops">Primary Crops</Label>
                      <Input 
                        id="primaryCrops" 
                        value={farmInfo.primaryCrops}
                        onChange={(e) => setFarmInfo(prev => ({ ...prev, primaryCrops: e.target.value }))}
                        placeholder="e.g., Wheat, Rice, Lentils"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="farmDescription">Farm Description</Label>
                      <Textarea 
                        id="farmDescription" 
                        value={farmInfo.farmDescription}
                        onChange={(e) => setFarmInfo(prev => ({ ...prev, farmDescription: e.target.value }))}
                        placeholder="Describe your farm, methods, and specialties"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Input 
                        id="certifications" 
                        value={farmInfo.certifications}
                        onChange={(e) => setFarmInfo(prev => ({ ...prev, certifications: e.target.value }))}
                        placeholder="e.g., Organic Certified, Quality Assured, Fair Trade"
                      />
                      <p className="text-xs text-muted-foreground">Separate multiple certifications with commas</p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Farm Information"}
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive email updates about your account activity</p>
                        </div>
                        <Switch 
                          checked={Object.values(notificationSettings.email).some(v => v)} 
                          onCheckedChange={(checked) => {
                            const updatedEmail = Object.keys(notificationSettings.email).reduce((acc, key) => {
                              acc[key as keyof typeof notificationSettings.email] = checked;
                              return acc;
                            }, {} as typeof notificationSettings.email);
                            
                            setNotificationSettings(prev => ({
                              ...prev,
                              email: updatedEmail
                            }));
                            
                            if (profile?.id) {
                              supabase
                                .from('notification_settings')
                                .update({
                                  settings: {
                                    ...notificationSettings,
                                    email: updatedEmail
                                  }
                                })
                                .eq('user_id', profile.id);
                            }
                          }}
                        />
                      </div>
                      
                      {Object.values(notificationSettings.email).some(v => v) && (
                        <div className="pl-6 border-l space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Order Updates</h4>
                              <p className="text-sm text-muted-foreground">Get notified about new orders and status changes</p>
                            </div>
                            <Switch 
                              checked={notificationSettings.email.orders} 
                              onCheckedChange={(checked) => handleUpdateNotificationSettings('email', 'orders', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Auction Alerts</h4>
                              <p className="text-sm text-muted-foreground">Receive notifications about auction activity</p>
                            </div>
                            <Switch 
                              checked={notificationSettings.email.bids} 
                              onCheckedChange={(checked) => handleUpdateNotificationSettings('email', 'bids', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Price Alerts</h4>
                              <p className="text-sm text-muted-foreground">Get notified when market prices change significantly</p>
                            </div>
                            <Switch 
                              checked={notificationSettings.email.pricingAlerts} 
                              onCheckedChange={(checked) => handleUpdateNotificationSettings('email', 'pricingAlerts', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Marketing Updates</h4>
                              <p className="text-sm text-muted-foreground">Receive information about new features and offers</p>
                            </div>
                            <Switch 
                              checked={notificationSettings.email.promotions} 
                              onCheckedChange={(checked) => handleUpdateNotificationSettings('email', 'promotions', checked)}
                            />
                          </div>
                        </div>
                      )}
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
                      <div className="space-y-4">
                        <h4 className="font-medium">Change Password</h4>
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
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

export default FarmerProfile;
