import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  trader_id: string;
  farmer_id: string;
  title: string;
  appointment_date: string;
  appointment_time: string;
  location: string;
  status: string;
  created_at: string;
  trader: {
    name: string;
  };
}

export const FarmerAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAppointment, setNewAppointment] = useState({
    trader_id: '',
    title: '',
    appointment_date: '',
    appointment_time: '',
    location: '',
  });
  const [availableTraders, setAvailableTraders] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
    fetchAvailableTraders();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          trader:profiles(
            name
          )
        `)
        .eq('farmer_id', user?.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTraders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'trader');

      if (error) throw error;
      setAvailableTraders(data || []);
    } catch (error) {
      console.error('Error fetching available traders:', error);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          ...newAppointment,
          farmer_id: user?.id,
          status: 'upcoming',
        }]);

      if (error) throw error;

      // Create a notification for the trader
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: newAppointment.trader_id,
          title: 'New Appointment Scheduled',
          message: `An appointment has been scheduled for ${newAppointment.appointment_date} at ${newAppointment.appointment_time}`,
          type: 'appointment',
          metadata: {
            trader_id: newAppointment.trader_id
          }
        }]);

      if (notificationError) throw notificationError;

      setNewAppointment({
        trader_id: '',
        title: '',
        appointment_date: '',
        appointment_time: '',
        location: '',
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Create a notification for the trader
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: appointment.trader_id,
            title: 'Appointment Status Updated',
            message: `Appointment status has been updated to ${newStatus}`,
            type: 'appointment',
            metadata: {
              appointment_id: appointmentId
            }
          }]);

        if (notificationError) throw notificationError;
      }

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        <form onSubmit={handleCreateAppointment} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="trader_id">Trader</Label>
              <Select
                value={newAppointment.trader_id}
                onValueChange={(value) => setNewAppointment(prev => ({ ...prev, trader_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trader" />
                </SelectTrigger>
                <SelectContent>
                  {availableTraders.map((trader) => (
                    <SelectItem key={trader.id} value={trader.id}>
                      {trader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="appointment_date">Date</Label>
              <Input
                id="appointment_date"
                type="date"
                value={newAppointment.appointment_date}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="appointment_time">Time</Label>
              <Input
                id="appointment_time"
                type="time"
                value={newAppointment.appointment_time}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>
          <Button type="submit">Create Appointment</Button>
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle>{appointment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Trader: {appointment.trader.name}</p>
                      <p className="font-medium">Date: {formatDate(appointment.appointment_date)}</p>
                      <p className="font-medium">Time: {appointment.appointment_time}</p>
                    </div>
                    <div>
                      <p>Location: {appointment.location}</p>
                      <p>Status: {appointment.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'upcoming' && (
                        <>
                          <Button
                            onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                          >
                            Mark as Completed
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}; 