import { supabase } from '@/integrations/supabase/client';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../types/appointment';

interface UserWithProfile {
  id: string;
  name: string;
}

interface TransactionUser {
  trader_id?: string;
  farmer_id?: string;
  bidder_id?: string;
  profiles: {
    id: string;
    name: string;
  };
}

export const appointmentService = {
  async createAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getFarmerAppointments(farmerId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTraderAppointments(traderId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('trader_id', traderId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateAppointment(id: string, updates: UpdateAppointmentDto): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUpcomingAppointments(userId: string, role: 'farmer' | 'trader'): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq(`${role}_id`, userId)
      .eq('status', 'upcoming')
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getUsersWithPreviousTransactions(userId: string, userRole: 'farmer' | 'trader'): Promise<UserWithProfile[]> {
    try {
      // Get users from orders
      const { data: orderUsers, error: orderError } = await supabase
        .from('orders')
        .select(`${userRole === 'farmer' ? 'trader_id' : 'farmer_id'}, profiles!${userRole === 'farmer' ? 'trader_id' : 'farmer_id'}(id, name)`)
        .eq(`${userRole === 'farmer' ? 'farmer_id' : 'trader_id'}`, userId);

      if (orderError) throw orderError;

      // Get users from bids
      const { data: bidUsers, error: bidError } = await supabase
        .from('bids')
        .select(`${userRole === 'farmer' ? 'bidder_id' : 'farmer_id'}, profiles!${userRole === 'farmer' ? 'bidder_id' : 'farmer_id'}(id, name)`)
        .eq(`${userRole === 'farmer' ? 'farmer_id' : 'bidder_id'}`, userId);

      if (bidError) throw bidError;

      // Get users from auctions
      const { data: auctionUsers, error: auctionError } = await supabase
        .from('auctions')
        .select(`${userRole === 'farmer' ? 'trader_id' : 'farmer_id'}, profiles!${userRole === 'farmer' ? 'trader_id' : 'farmer_id'}(id, name)`)
        .eq(`${userRole === 'farmer' ? 'farmer_id' : 'trader_id'}`, userId);

      if (auctionError) throw auctionError;

      // Combine and deduplicate users
      const allUsers = [
        ...(orderUsers || []),
        ...(bidUsers || []),
        ...(auctionUsers || [])
      ] as unknown as TransactionUser[];

      // Create a map to deduplicate users by ID
      const userMap = new Map<string, UserWithProfile>();
      allUsers.forEach(user => {
        const userId = user[userRole === 'farmer' ? 'trader_id' : 'farmer_id'];
        const profile = user.profiles;
        if (userId && profile) {
          userMap.set(userId, {
            id: userId,
            name: profile.name
          });
        }
      });

      return Array.from(userMap.values());
    } catch (error) {
      console.error('Error fetching users with previous transactions:', error);
      throw error;
    }
  }
}; 