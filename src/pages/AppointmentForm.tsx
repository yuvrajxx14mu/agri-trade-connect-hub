import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services/appointmentService';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const users = await appointmentService.getUsersWithPreviousTransactions(profile.id, profile.role as 'farmer' | 'trader');
        setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [profile?.id, profile?.role, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !userId || !date || !time || !title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const appointmentData = {
        title,
        trader_id: profile.role === 'farmer' ? userId : profile.id,
        farmer_id: profile.role === 'farmer' ? profile.id : userId,
        appointment_date: date,
        appointment_time: time,
        location: location || "Virtual Meeting",
        status: "upcoming"
      };

      await appointmentService.createAppointment(appointmentData);
      
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      
      navigate('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userRole={profile?.role || 'farmer'}>
      <DashboardHeader 
        title="Book Appointment" 
        userName={profile?.name || "User"} 
        userRole={profile?.role || 'farmer'}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Request an Appointment
          </CardTitle>
          <CardDescription>
            Fill in the details to request an appointment with a {profile?.role === 'farmer' ? 'trader' : 'farmer'}
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
              
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="user">{profile?.role === 'farmer' ? 'Trader' : 'Farmer'}</Label>
                <Select 
                  value={userId} 
                  onValueChange={setUserId}
                  disabled={loading}
                >
                  <SelectTrigger id="user">
                    <SelectValue placeholder={`Select a ${profile?.role === 'farmer' ? 'trader' : 'farmer'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <SelectItem value="" disabled>
                        No {profile?.role === 'farmer' ? 'traders' : 'farmers'} found with previous transactions
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Virtual Meeting or Physical Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional information"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Scheduling..." : "Schedule Appointment"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </DashboardLayout>
  );
};

export default AppointmentForm;
