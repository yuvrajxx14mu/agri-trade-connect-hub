
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock, MapPin, Check, X, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

interface Farmer {
  id: string;
  name: string;
  location?: string;
}

interface Appointment {
  id: string;
  title: string;
  farmer_id: string;
  trader_id: string;
  appointment_date: string;
  appointment_time: string;
  location: string;
  status: string;
  farmer_name?: string;
}

const TraderAppointments = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedFarmer, setSelectedFarmer] = useState<string | undefined>(undefined);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  
  useEffect(() => {
    if (profile?.id) {
      fetchAppointments();
      fetchFarmers();
      
      // Set up real-time subscription for appointment updates
      const channel = supabase
        .channel('appointments-changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'appointments', filter: `trader_id=eq.${profile.id}` }, 
          () => { fetchAppointments(); }
        )
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `trader_id=eq.${profile.id}` }, 
          () => { fetchAppointments(); }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);
  
  const fetchAppointments = async () => {
    if (!profile?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:farmer_id(name)
        `)
        .eq('trader_id', profile.id)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      // Format the appointments with farmer name
      const formattedAppointments = data.map(appointment => ({
        ...appointment,
        farmer_name: appointment.profiles?.name
      }));
      
      setAppointments(formattedAppointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, address')
        .eq('role', 'farmer');
      
      if (error) throw error;
      
      setFarmers(data.map(farmer => ({
        id: farmer.id,
        name: farmer.name,
        location: farmer.address
      })) || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast({
        title: "Error",
        description: "Failed to load farmers list",
        variant: "destructive"
      });
    }
  };
  
  const createAppointment = async () => {
    if (!profile?.id || !selectedDate || !selectedTime || !selectedFarmer || !meetingTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          title: meetingTitle,
          trader_id: profile.id,
          farmer_id: selectedFarmer,
          appointment_date: formattedDate,
          appointment_time: selectedTime,
          location: meetingLocation || "Virtual Meeting",
          status: "pending"
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      
      // Reset form & close dialog
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setSelectedFarmer(undefined);
      setMeetingTitle("");
      setMeetingLocation("");
      setIsDialogOpen(false);
      
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Appointment ${status === 'cancelled' ? 'cancelled' : 'confirmed'}`,
      });
      
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === "upcoming") {
      return (appointmentDate >= today) && appointment.status !== "cancelled";
    } else if (activeTab === "past") {
      return (appointmentDate < today) || appointment.status === "cancelled";
    }
    return true;
  });
  
  const groupAppointmentsByDate = () => {
    const grouped = new Map();
    
    filteredAppointments.forEach(appointment => {
      const date = appointment.appointment_date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date).push(appointment);
    });
    
    return Array.from(grouped).sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });
  };
  
  const groupedAppointments = groupAppointmentsByDate();
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Appointments" userName={profile?.name || "User"} userRole="trader" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>My Appointments</CardTitle>
            <CardDescription>Schedule and manage meetings with farmers</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 bg-agri-trader">
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a meeting with a farmer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Date</label>
                    <div className="border rounded-md">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Farmer</label>
                    <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a farmer" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map(farmer => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <label className="text-sm font-medium mt-4">Select Time</label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
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
                    
                    <label className="text-sm font-medium mt-4">Meeting Title</label>
                    <Input
                      placeholder="Enter meeting purpose"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                    />
                    
                    <label className="text-sm font-medium mt-4">Location</label>
                    <Input
                      placeholder="Enter meeting location (or leave blank for virtual)"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createAppointment} 
                  disabled={!selectedDate || !selectedTime || !selectedFarmer || !meetingTitle || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Appointment"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past & Cancelled</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-6">
                {groupedAppointments.map(([date, appointments]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="font-medium flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appointments.map((appointment: Appointment) => (
                        <Card key={appointment.id} className="overflow-hidden">
                          <div className={`h-2 ${
                            appointment.status === 'confirmed' ? 'bg-green-500' :
                            appointment.status === 'cancelled' ? 'bg-red-500' :
                            appointment.status === 'completed' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`} />
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium">{appointment.title}</h4>
                                <p className="text-sm text-muted-foreground">with {appointment.farmer_name}</p>
                              </div>
                              {getStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{appointment.appointment_time}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                            
                            {appointment.status === "pending" && (
                              <div className="flex justify-end gap-2 mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Confirm
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming appointments." 
                    : "You don't have any past appointments."}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Schedule New Appointment
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderAppointments;
