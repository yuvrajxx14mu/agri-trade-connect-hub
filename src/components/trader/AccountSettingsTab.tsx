import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Shield, Key } from "lucide-react";

const AccountSettingsTab = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>
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
  );
};

export default AccountSettingsTab;
