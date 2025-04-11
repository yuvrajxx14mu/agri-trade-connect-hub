import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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

        if (error) {
          // If no record exists yet, create one with default settings
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('notification_settings')
              .insert({
                user_id: profile.id,
                settings: settings
              });
            
            if (insertError) throw insertError;
          } else {
            throw error;
          }
        } else if (data && data.settings) {
          // Safely type cast the settings data
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

  // Get appropriate user role, default to "trader" if not available
  const userRole = profile?.role || "trader";

  return (
    <DashboardLayout userRole={userRole}>
      <DashboardHeader title="Settings" userName={profile?.name || "User"} userRole={userRole} />
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Account Settings</h3>
                  <p className="text-sm text-gray-500">
                    Manage your account settings and preferences.
                  </p>
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
