
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings as SettingsIcon, PaintBucket, Bell, Shield, Globe, Moon, Sun, Laptop, CheckCircle, HelpCircle } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [userRole, setUserRole] = useState("farmer"); // This would normally come from auth context
  
  return (
    <DashboardLayout userRole={userRole as "farmer" | "trader"}>
      <DashboardHeader title="Settings" userName={userRole === "farmer" ? "Rajesh Kumar" : "Vikram Sharma"} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-4 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      defaultValue={userRole === "farmer" ? "rajesh.kumar@example.com" : "vikram.sharma@example.com"} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      defaultValue={userRole === "farmer" ? "+91 98765 43210" : "+91 98765 12345"} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="pa">Punjabi</SelectItem>
                        <SelectItem value="gu">Gujarati</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="IST">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IST">Indian Standard Time (IST)</SelectItem>
                        <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                        <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailUpdates" className="font-medium">Email Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive account updates via email</p>
                    </div>
                    <Switch id="emailUpdates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
                    </div>
                    <Switch id="smsNotifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketUpdates" className="font-medium">Market Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive daily market price updates</p>
                    </div>
                    <Switch id="marketUpdates" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PaintBucket className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <Card className="flex-1 cursor-pointer border-primary">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Sun className="h-5 w-5" />
                      <div className="flex-1">Light</div>
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </CardContent>
                  </Card>
                  <Card className="flex-1 cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Moon className="h-5 w-5" />
                      <div className="flex-1">Dark</div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1 cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Laptop className="h-5 w-5" />
                      <div className="flex-1">System</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Color Scheme</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-agri-farmer mb-2 cursor-pointer border-4 border-primary"></div>
                    <span className="text-sm">Farmer Green</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-agri-trader mb-2 cursor-pointer"></div>
                    <span className="text-sm">Trader Blue</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-amber-600 mb-2 cursor-pointer"></div>
                    <span className="text-sm">Amber</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-purple-600 mb-2 cursor-pointer"></div>
                    <span className="text-sm">Purple</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Layout Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compactMode" className="font-medium">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Reduce spacing to fit more content</p>
                    </div>
                    <Switch id="compactMode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="largeFonts" className="font-medium">Large Fonts</Label>
                      <p className="text-sm text-muted-foreground">Increase text size for better readability</p>
                    </div>
                    <Switch id="largeFonts" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Apply Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderUpdates" className="font-medium">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications about your orders</p>
                    </div>
                    <Switch id="orderUpdates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auctionAlerts" className="font-medium">Auction Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications about auctions</p>
                    </div>
                    <Switch id="auctionAlerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketPrices" className="font-medium">Market Price Updates</Label>
                      <p className="text-sm text-muted-foreground">Daily notifications about market prices</p>
                    </div>
                    <Switch id="marketPrices" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newsUpdates" className="font-medium">Agricultural News</Label>
                      <p className="text-sm text-muted-foreground">News related to agriculture and trade</p>
                    </div>
                    <Switch id="newsUpdates" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="instantAlerts" className="font-medium">Instant Alerts</Label>
                      <p className="text-sm text-muted-foreground">Real-time notifications for important updates</p>
                    </div>
                    <Switch id="instantAlerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="bidNotifications" className="font-medium">Bid Notifications</Label>
                      <p className="text-sm text-muted-foreground">Alerts when bids are placed or updated</p>
                    </div>
                    <Switch id="bidNotifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="shipmentTracking" className="font-medium">Shipment Tracking</Label>
                      <p className="text-sm text-muted-foreground">Updates about your shipment status</p>
                    </div>
                    <Switch id="shipmentTracking" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Notification Frequency</h3>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Email Digest Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input type="password" id="currentPassword" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input type="password" id="newPassword" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input type="password" id="confirmPassword" />
                </div>
                <Button>Update Password</Button>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Two-Factor Authentication</div>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Setup 2FA
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You'll need an authenticator app like Google Authenticator or Authy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Login Sessions</h3>
                <p className="text-sm text-muted-foreground">These are devices that have logged into your account.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <div className="font-medium">Current Device</div>
                      <p className="text-sm text-muted-foreground">Mumbai, India • 192.168.1.1 • Chrome on Windows</p>
                    </div>
                    <Badge>Active Now</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <div className="font-medium">Mobile Device</div>
                      <p className="text-sm text-muted-foreground">Delhi, India • 10.0.0.5 • Android App</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Log Out
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profileVisibility" className="font-medium">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Select defaultValue="verified">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="verified">Verified Users Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataSharing" className="font-medium">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share anonymized data for platform improvement</p>
                    </div>
                    <Switch id="dataSharing" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
