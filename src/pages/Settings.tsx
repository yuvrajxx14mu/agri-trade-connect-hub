
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    twoFactorAuth: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      bids: true,
      orders: true,
      shipments: true,
      pricingAlerts: true,
      appointments: true,
      promotions: false,
    },
    push: {
      bids: true,
      orders: true,
      shipments: true,
      pricingAlerts: true,
      appointments: true,
      promotions: false,
    }
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bio: "",
    website: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fix the userRole type by casting it to the required type
  const userPath = location.pathname.includes('farmer') ? 'farmer' : 'trader';
  const userRole = userPath as "farmer" | "trader";
  
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || "",
        phone: profile.phone || "",
        email: user?.email || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        bio: profile.bio || "",
        website: profile.website || ""
      }));
      
      // Fetch user preferences
      fetchUserPreferences();
      
      // Fetch notification settings
      fetchNotificationSettings();
      
      setLoading(false);
    }
  }, [profile, user]);
  
  const fetchUserPreferences = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', profile.id)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching user preferences:', error);
        } else {
          // Create default preferences if not found
          await supabase.from('user_preferences').insert({
            user_id: profile.id,
            dark_mode: false,
            compact_view: false,
            two_factor_auth: false
          });
        }
        return;
      }
      
      if (data) {
        setPreferences({
          darkMode: data.dark_mode,
          compactView: data.compact_view,
          twoFactorAuth: data.two_factor_auth
        });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };
  
  const fetchNotificationSettings = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('settings')
        .eq('user_id', profile.id)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching notification settings:', error);
        }
        return;
      }
      
      if (data?.settings) {
        setNotificationSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleToggleChange = async (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update in DB in real-time
    if (profile?.id) {
      try {
        await supabase.from('user_preferences').upsert({
          user_id: profile.id,
          dark_mode: key === 'darkMode' ? value : preferences.darkMode,
          compact_view: key === 'compactView' ? value : preferences.compactView,
          two_factor_auth: key === 'twoFactorAuth' ? value : preferences.twoFactorAuth
        });
      } catch (error) {
        console.error('Error updating user preferences:', error);
      }
    }
  };
  
  const handleEmailNotificationChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  };
  
  const handlePushNotificationChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value
      }
    }));
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    
    try {
      const { error } = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        bio: formData.bio,
        website: formData.website
      });
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your account information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update account information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: profile.id,
          settings: notificationSettings
        });
        
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (error) throw error;
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetToDefaults = () => {
    const defaultSettings = {
      email: {
        bids: true,
        orders: true,
        shipments: true,
        pricingAlerts: true,
        appointments: true,
        promotions: false,
      },
      push: {
        bids: true,
        orders: true,
        shipments: true,
        pricingAlerts: true,
        appointments: true,
        promotions: false,
      }
    };
    
    setNotificationSettings(defaultSettings);
    
    toast({
      title: "Reset to defaults",
      description: "Notification settings have been reset to defaults. Click Save to apply changes.",
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <DashboardHeader 
        title="Settings" 
        userName={profile?.name || "User"}
        userRole={userRole}
      />
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex h-10 items-center">
                      <Badge variant="outline">{userRole === "farmer" ? "Farmer" : "Trader"}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile</h3>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    name="bio"
                    value={formData.bio} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website"
                      value={formData.website} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={formData.address} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city"
                      value={formData.city} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      name="state"
                      value={formData.state} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input 
                      id="pincode" 
                      name="pincode"
                      value={formData.pincode} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-orders">Orders</Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications for new orders</p>
                    </div>
                    <Switch 
                      id="email-orders" 
                      checked={notificationSettings.email.orders}
                      onCheckedChange={(value) => handleEmailNotificationChange('orders', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-auctions">Auctions</Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications for auction updates</p>
                    </div>
                    <Switch 
                      id="email-auctions" 
                      checked={notificationSettings.email.bids}
                      onCheckedChange={(value) => handleEmailNotificationChange('bids', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-shipments">Shipments</Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications for shipment updates</p>
                    </div>
                    <Switch 
                      id="email-shipments" 
                      checked={notificationSettings.email.shipments}
                      onCheckedChange={(value) => handleEmailNotificationChange('shipments', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-pricing">Pricing Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates about market price changes</p>
                    </div>
                    <Switch 
                      id="email-pricing" 
                      checked={notificationSettings.email.pricingAlerts}
                      onCheckedChange={(value) => handleEmailNotificationChange('pricingAlerts', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-appointments">Appointments</Label>
                      <p className="text-sm text-muted-foreground">Receive email reminders about upcoming appointments</p>
                    </div>
                    <Switch 
                      id="email-appointments" 
                      checked={notificationSettings.email.appointments}
                      onCheckedChange={(value) => handleEmailNotificationChange('appointments', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-marketing">Promotions</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates about products, services, and promotions</p>
                    </div>
                    <Switch 
                      id="email-marketing" 
                      checked={notificationSettings.email.promotions}
                      onCheckedChange={(value) => handleEmailNotificationChange('promotions', value)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-orders">Orders</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications for new orders</p>
                    </div>
                    <Switch 
                      id="push-orders" 
                      checked={notificationSettings.push.orders}
                      onCheckedChange={(value) => handlePushNotificationChange('orders', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-bids">Bids & Auctions</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications for bids and auctions</p>
                    </div>
                    <Switch 
                      id="push-bids" 
                      checked={notificationSettings.push.bids}
                      onCheckedChange={(value) => handlePushNotificationChange('bids', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-shipments">Shipments</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications for shipping updates</p>
                    </div>
                    <Switch 
                      id="push-shipments" 
                      checked={notificationSettings.push.shipments}
                      onCheckedChange={(value) => handlePushNotificationChange('shipments', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-pricing">Pricing Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications for market price changes</p>
                    </div>
                    <Switch 
                      id="push-pricing" 
                      checked={notificationSettings.push.pricingAlerts}
                      onCheckedChange={(value) => handlePushNotificationChange('pricingAlerts', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-appointments">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive push reminders about upcoming appointments</p>
                    </div>
                    <Switch 
                      id="push-appointments" 
                      checked={notificationSettings.push.appointments}
                      onCheckedChange={(value) => handlePushNotificationChange('appointments', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-promotions">Promotions & News</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications about promotions and platform news</p>
                    </div>
                    <Switch 
                      id="push-promotions" 
                      checked={notificationSettings.push.promotions}
                      onCheckedChange={(value) => handlePushNotificationChange('promotions', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetToDefaults}>Reset to Defaults</Button>
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a dark color theme</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={preferences.darkMode}
                    onCheckedChange={(value) => handleToggleChange('darkMode', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Show more content in less space</p>
                  </div>
                  <Switch 
                    id="compact-view" 
                    checked={preferences.compactView}
                    onCheckedChange={(value) => handleToggleChange('compactView', value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  // Save in DB is already handled by toggle change
                  toast({
                    title: "Settings saved",
                    description: "Your appearance settings have been saved successfully.",
                  });
                }}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      name="currentPassword"
                      type="password" 
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleChangePassword}
                  disabled={saving || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={preferences.twoFactorAuth}
                    onCheckedChange={(value) => handleToggleChange('twoFactorAuth', value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Activity</h3>
                <Button variant="outline">View Recent Login Activity</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
