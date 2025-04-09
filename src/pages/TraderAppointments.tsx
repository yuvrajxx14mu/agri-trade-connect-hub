import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Database } from '../integrations/supabase/types';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  farmer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  }
};

const TraderAppointments = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    farmerId: '',
    date: '',
    time: '',
    location: ''
  });
  const [date, setDate] = useState<Date | undefined>(new Date());

  const fetchAppointments = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          farmer:profiles!appointments_farmer_id_fkey(id, name, phone, address, city, state)
        `)
        .eq('trader_id', profile.id);
      
      if (error) throw error;
      
      setAppointments(data || []);
      setFilteredAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [profile?.id]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = appointments.filter(appointment =>
      appointment.title.toLowerCase().includes(searchTerm) ||
      appointment.farmer.name.toLowerCase().includes(searchTerm)
    );
    setFilteredAppointments(filtered);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createAppointment = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          title: formData.title,
          farmer_id: formData.farmerId,
          trader_id: profile.id,
          appointment_date: formData.date,
          appointment_time: formData.time,
          location: formData.location,
          status: 'scheduled'
        })
        .select();
      
      if (error) throw error;
      
      fetchAppointments();
      closeCreateModal();
      toast({
        title: 'Appointment Created',
        description: 'New appointment has been scheduled.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({
        title: 'Error',
        description: 'Failed to create appointment',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAppointment(newAppointment);
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Appointments" userName={profile?.name || "Trader"} />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Appointment List</CardTitle>
            <CardDescription>Manage your scheduled appointments</CardDescription>
          </div>
          <Button onClick={openCreateModal}>
            Schedule Appointment
          </Button>
        </CardHeader>
        <CardContent>
          <Input
            type="search"
            placeholder="Search appointments..."
            onChange={handleSearch}
            className="mb-4"
          />

          <Table>
            <TableCaption>A list of your scheduled appointments.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.title}</TableCell>
                  <TableCell>{appointment.farmer.name}</TableCell>
                  <TableCell>{appointment.appointment_date}</TableCell>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell>{appointment.location}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Schedule New Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Appointment Title"
                  value={newAppointment.title}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="farmerId">Farmer ID</Label>
                <Input
                  type="text"
                  id="farmerId"
                  name="farmerId"
                  placeholder="Farmer ID"
                  value={newAppointment.farmerId}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  type="text"
                  id="date"
                  name="date"
                  placeholder="Date"
                  value={newAppointment.date}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  type="time"
                  id="time"
                  name="time"
                  placeholder="Time"
                  value={newAppointment.time}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Location"
                  value={newAppointment.location}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={closeCreateModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TraderAppointments;
