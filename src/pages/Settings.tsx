import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<{
    email: {
      bids: boolean;
      orders: boolean;
      shipments: boolean;
      pricingAlerts: boolean;
      appointments: boolean;
      promotions: boolean;
    };
    push: {
      bids: boolean;
      orders: boolean;
      shipments: boolean;
      pricingAlerts: boolean;
      appointments: boolean;
      promotions: boolean;
    };
  }>({
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
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!profile?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('settings')
          .eq('user_id', profile.id)
          .single();

        if (error) throw error;
        
        if (data && data.settings) {
          // Ensure proper type casting
          const settingsData = data.settings as {
            email: {
              bids: boolean;
              orders: boolean;
              shipments: boolean;
              pricingAlerts: boolean;
              appointments: boolean;
              promotions: boolean;
            };
            push: {
              bids: boolean;
              orders: boolean;
              shipments: boolean;
              pricingAlerts: boolean;
              appointments: boolean;
              promotions: boolean;
            };
          };
          
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast({
          title: "Error",
          description: "Failed to load notification settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [profile?.id, toast]);

  const handleSettingsChange = (group: string, key: string, value: boolean) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [group]: {
        ...prevSettings[group],
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: profile.id,
          settings: settings,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification settings updated successfully!",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader title="Settings" userName={profile?.name || "User"} />
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage your notification preferences for email and push notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                <div>
                  <h4 className="mb-2 font-semibold">Email Notifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`email-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Switch
                          id={`email-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleSettingsChange('email', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Push Notifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`push-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Switch
                          id={`push-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleSettingsChange('push', key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Settings;
