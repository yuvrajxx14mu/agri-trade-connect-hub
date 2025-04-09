
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./use-toast";

export interface PriceAlert {
  id: string;
  user_id: string;
  product_name: string;
  condition: string;
  target_price: number;
  status: string;
  created_at: string;
}

export const usePriceAlerts = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const fetchAlerts = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setAlerts(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching price alerts:', err);
      setError('Failed to load price alerts');
      setLoading(false);
    }
  }, [profile?.id]);

  const createAlert = useCallback(async (alert: Omit<PriceAlert, 'id' | 'user_id' | 'created_at'>) => {
    if (!profile?.id) return null;
    
    try {
      const newAlert = {
        ...alert,
        user_id: profile.id
      };
      
      const { data, error: createError } = await supabase
        .from('price_alerts')
        .insert(newAlert)
        .select();
      
      if (createError) throw createError;
      
      if (data) {
        setAlerts(prev => [data[0], ...prev]);
        
        toast({
          title: "Alert Created",
          description: `You'll be notified when ${alert.product_name} reaches your target price`,
          variant: "default"
        });
        
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error creating price alert:', err);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive"
      });
      return null;
    }
  }, [profile?.id, toast]);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);
      
      if (deleteError) throw deleteError;
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alert Deleted",
        description: "Price alert has been deleted",
        variant: "default"
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting price alert:', err);
      toast({
        title: "Error",
        description: "Failed to delete price alert",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const toggleAlertStatus = useCallback(async (alertId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error: updateError } = await supabase
        .from('price_alerts')
        .update({ status: newStatus })
        .eq('id', alertId);
      
      if (updateError) throw updateError;
      
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: newStatus } 
            : alert
        )
      );
      
      toast({
        title: `Alert ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Price alert is now ${newStatus}`,
        variant: "default"
      });
      
      return true;
    } catch (err) {
      console.error('Error updating price alert status:', err);
      toast({
        title: "Error",
        description: "Failed to update price alert status",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    if (profile?.id) {
      fetchAlerts();
    }
  }, [profile?.id, fetchAlerts]);

  return {
    loading,
    error,
    alerts,
    createAlert,
    deleteAlert,
    toggleAlertStatus,
    fetchAlerts
  };
};
