
import { useState, useEffect } from "react";
import { format, addDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Calendar as CalendarIcon, Plus, Clock, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  location: string;
  status: string;
  farmer_id: string;
  trader_id: string;
  created_at: string;
  updated_at: string;
}

const FarmerAppointments = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    date: new Date(),
    time: "",
    location: "",
    traderId: ""
  });
  
  // Traders list for the form
  const [traders, setTraders] = useState<any[]>([]);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('farmer_id', profile.id);
        
        if (error) throw error;
        
        setAppointments(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [profile?.id, toast]);
  
  // Fetch traders for the form
  useEffect(() => {
    const fetchTraders = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'trader');
        
        if (error) throw error;
        
        setTraders(data || []);
      } catch (err) {
        console.error('Error fetching traders:', err);
      }
    };
    
    fetchTraders();
  }, []);
  
  const handleCreateAppointment = async () => {
    if (!profile?.id) return;
    
    try {
      // Validate form
      if (!newAppointment.title || !newAppointment.date || !newAppointment.time || !newAppointment.location || !newAppointment.traderId) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Format the date properly for Supabase
      const formattedDate = format(newAppointment.date, 'yyyy-MM-dd');
      
      // Create new appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          title: newAppointment.title,
          appointment_date: formattedDate,
          appointment_time: newAppointment.time,
          location: newAppointment.location,
          status: 'upcoming',
          farmer_id: profile.id,
          trader_id: newAppointment.traderId
        })
        .select();
      
      if (error) throw error;
      
      // Update local state
      if (data) {
        setAppointments(prev => [...prev, data[0]]);
        
        // Create notification for trader
        await supabase
          .from('notifications')
          .insert({
            user_id: newAppointment.traderId,
            title: "New Appointment Request",
            message: `${profile.name} has requested an appointment: ${newAppointment.title}`,
            type: "appointment",
            read: false
          });
        
        toast({
          title: "Success",
          description: "Appointment created successfully",
          variant: "default"
        });
        
        // Reset form and close dialog
        setNewAppointment({
          title: "",
          date: new Date(),
          time: "",
          location: "",
          traderId: ""
        });
        
        setIsDialogOpen(false);
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive"
      });
    }
  };
  
  // Filtered appointments based on search, date and tab
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "upcoming" 
      ? appointment.status === "upcoming" || appointment.status === "confirmed"
      : appointment.status === "completed" || appointment.status === "cancelled";
    
    const matchesDate = selectedDate 
      ? appointment.appointment_date === format(selectedDate, 'yyyy-MM-dd')
      : true;
    
    return matchesSearch && matchesTab && matchesDate;
  });
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Appointments" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>Manage your meetings and appointments</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>
                    Create a new appointment with a trader
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Product Quality Inspection"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <DatePicker
                        date={newAppointment.date}
                        setDate={(date) => setNewAppointment(prev => ({ ...prev, date: date || new Date() }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        placeholder="e.g., 10:00 AM"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Farm Location or Virtual Meeting"
                      value={newAppointment.location}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trader">Trader</Label>
                    <Select 
                      value={newAppointment.traderId} 
                      onValueChange={(value) => setNewAppointment(prev => ({ ...prev, traderId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trader" />
                      </SelectTrigger>
                      <SelectContent>
                        {traders.map(trader => (
                          <SelectItem key={trader.id} value={trader.id}>{trader.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateAppointment}>Schedule Appointment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search appointments..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-primary p-4 sm:p-6 text-primary-foreground sm:w-32 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start">
                            <div className="text-xl sm:text-2xl font-bold">
                              {format(parseISO(appointment.appointment_date), "dd")}
                            </div>
                            <div className="text-sm">
                              {format(parseISO(appointment.appointment_date), "MMM yyyy")}
                            </div>
                          </div>
                          <div className="p-4 sm:p-6 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{appointment.title}</h3>
                              <Badge variant="outline" className={
                                appointment.status === "upcoming" 
                                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                                  : appointment.status === "confirmed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : appointment.status === "cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              With: {traders.find(t => t.id === appointment.trader_id)?.name || "Trader"}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{appointment.appointment_time}</span>
                              </div>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === "upcoming" 
                        ? "You don't have any upcoming appointments for the selected filters." 
                        : "You don't have any completed appointments matching your search."}
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule New Appointment
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select date to filter appointments</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            <div className="pt-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerAppointments;
