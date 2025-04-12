import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { CalendarClock, Loader2, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [traders, setTraders] = useState([]);
  const [title, setTitle] = useState("");
  const [traderId, setTraderId] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchTraders = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'trader');
          
        if (error) throw error;
        
        setTraders(data || []);
      } catch (error) {
        console.error('Error fetching traders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch traders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTraders();
  }, [profile?.id, toast]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile?.id || !traderId || !date || !time || !location || !title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const appointmentData = {
        farmer_id: profile.id,
        trader_id: traderId,
        title: title,
        appointment_date: format(date, 'yyyy-MM-dd'),
        appointment_time: time,
        location: location,
        status: "pending",
      };
      
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Create notification for trader
      await supabase.from('notifications').insert({
        user_id: traderId,
        title: "New Appointment Request",
        message: `${profile.name} has requested an appointment on ${format(date, 'PPP')} at ${time}`,
        type: "appointment"
      });
      
      toast({
        title: "Success",
        description: "Appointment request sent successfully!",
      });
      
      navigate('/farmer-appointments');
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader 
        title="Book Appointment" 
        userName={profile?.name || "Farmer"} 
        userRole="farmer"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Request an Appointment
          </CardTitle>
          <CardDescription>
            Fill in the details to request an appointment with a trader
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Appointment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Product Discussion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              {/* Trader Selection */}
              <div className="space-y-2">
                <Label htmlFor="trader">Trader</Label>
                <Select 
                  value={traderId} 
                  onValueChange={setTraderId}
                  disabled={loading}
                >
                  <SelectTrigger id="trader">
                    <SelectValue placeholder="Select a trader" />
                  </SelectTrigger>
                  <SelectContent>
                    {traders.map((trader) => (
                      <SelectItem key={trader.id} value={trader.id}>
                        {trader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker
                  date={date}
                  setDate={setDate}
                  disabled={(date) => date < new Date()}
                />
              </div>
              
              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select 
                  value={time} 
                  onValueChange={setTime}
                >
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-60">
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Trader's Office, Virtual Meeting"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about the appointment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate('/farmer-appointments')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitting || !traderId || !date || !time || !location || !title}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Appointment'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default AppointmentForm;
