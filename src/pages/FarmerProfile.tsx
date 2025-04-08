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
import { User, MapPin, Phone, Mail, Shield, Bell, Key, Upload, Calendar } from "lucide-react";

const FarmerProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Profile" userName="Rajesh Kumar" userRole="farmer" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mt-2 mb-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="Rajesh Kumar" />
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">Rajesh Kumar</h2>
              <p className="text-sm text-muted-foreground mb-1">Organic Wheat Farmer</p>
              <Badge variant="outline" className="bg-agri-farmer/10 text-agri-farmer mb-4">Verified Farmer</Badge>
              
              <div className="w-full space-y-3 mt-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Amritsar, Punjab</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>rajesh.kumar@example.com</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Member since Jan 2025</span>
                </div>
              </div>
              
              <div className="w-full mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Organic Certified</Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Quality Assured</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Fair Trade</Badge>
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
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Rajesh" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Kumar" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="rajesh.kumar@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="+91 98765 43210" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" defaultValue="123 Farm Road, Village Nurpur, Amritsar, Punjab - 143001" />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Save Changes</Button>
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
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input id="farmName" defaultValue="Green Valley Organics" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmSize">Farm Size (Acres)</Label>
                        <Input id="farmSize" defaultValue="25" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="primaryCrops">Primary Crops</Label>
                      <Input id="primaryCrops" defaultValue="Wheat, Rice, Lentils" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="farmDescription">Farm Description</Label>
                      <Textarea 
                        id="farmDescription" 
                        defaultValue="Family-owned organic farm specializing in high-quality wheat and rice cultivation using traditional methods combined with modern sustainable practices. Our farm has been certified organic for over 5 years."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Input id="certifications" defaultValue="Organic Certified, Quality Assured, Fair Trade" />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Update Farm Information</Button>
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
                          <h4 className="font-medium">Order Updates</h4>
                          <p className="text-sm text-muted-foreground">Get notified about new orders and status changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Auction Alerts</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications about auction activity</p>
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
