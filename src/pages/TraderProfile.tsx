import { useState } from "react";
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
import { User, MapPin, Phone, Mail, Shield, Bell, Key, Upload, Calendar, Building2 } from "lucide-react";

const TraderProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Profile" userName="Vikram Sharma" userRole="trader" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mt-2 mb-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram" alt="Vikram Sharma" />
                  <AvatarFallback>VS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">Vikram Sharma</h2>
              <p className="text-sm text-muted-foreground mb-1">Agricultural Trader</p>
              <Badge variant="outline" className="bg-agri-trader/10 text-agri-trader mb-4">Verified Trader</Badge>
              
              <div className="w-full space-y-3 mt-2">
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>VKS Agro Traders Pvt. Ltd.</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Mumbai, Maharashtra</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>+91 98765 12345</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>vikram.sharma@example.com</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Member since Jan 2025</span>
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
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Vikram" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Sharma" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="vikram.sharma@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="+91 98765 12345" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Residential Address</Label>
                      <Textarea id="address" defaultValue="501, Sea View Apartments, Marine Drive, Mumbai, Maharashtra - 400002" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue="Experienced agricultural trader with over 8 years in the industry. Specializing in cereals and pulses procurement with a focus on quality and fair trade practices. Established relationships with farmers across multiple states."
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="bg-agri-trader">Save Changes</Button>
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
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" defaultValue="VKS Agro Traders Pvt. Ltd." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Your Designation</Label>
                        <Input id="designation" defaultValue="Director of Procurement" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN Number</Label>
                        <Input id="gstin" defaultValue="27AADCB2230M1ZY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tradeLicense">Trade License Number</Label>
                        <Input id="tradeLicense" defaultValue="TRD12345678MH" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Company Address</Label>
                      <Textarea id="companyAddress" defaultValue="303-305, Trade Tower, Bandra Kurla Complex, Mumbai, Maharashtra - 400051" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">Business Description</Label>
                      <Textarea 
                        id="businessDescription" 
                        defaultValue="VKS Agro Traders is a leading agricultural trading company specializing in procurement and distribution of premium quality grains, pulses, and spices. We connect farmers with retail markets and processing industries, ensuring fair prices and quality products."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="operationalAreas">Operational Areas</Label>
                      <Input id="operationalAreas" defaultValue="Maharashtra, Gujarat, Punjab, Haryana, Madhya Pradesh" />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="bg-agri-trader">Update Company Information</Button>
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
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">New Auction Alerts</h4>
                          <p className="text-sm text-muted-foreground">Get notified when new auctions matching your criteria are posted</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Bid Status Updates</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications about your bid status changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Order & Shipment Alerts</h4>
                          <p className="text-sm text-muted-foreground">Get updates about your orders and shipments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Marketing Updates</h4>
                          <p className="text-sm text-muted-foreground">Receive information about new features and offers</p>
                        </div>
                        <Switch />
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
                        <Button className="bg-agri-trader">Save Changes</Button>
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
