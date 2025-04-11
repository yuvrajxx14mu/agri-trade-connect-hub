import { supabase } from '../lib/supabase';
import { BusinessDetails, CompanyFormData, ProfileFormData } from '../types/trader';
import { Appointment, CreateAppointmentDto } from '../types/appointment';
import { Bid, CreateBidDto } from '../types/bid';
import { Order, CreateOrderDto } from '../types/order';

export const traderService = {
  // Profile Management
  async updateProfile(userId: string, profileData: ProfileFormData) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Business Details Management
  async updateBusinessDetails(userId: string, businessData: CompanyFormData) {
    const { data, error } = await supabase
      .from('business_details')
      .upsert({
        user_id: userId,
        business_name: businessData.companyName,
        business_type: 'trader',
        business_address: businessData.companyAddress,
        gst_number: businessData.gstin,
        registration_number: businessData.tradeLicense,
        business_description: businessData.businessDescription,
        operational_areas: businessData.operationalAreas
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBusinessDetails(userId: string): Promise<BusinessDetails> {
    const { data, error } = await supabase
      .from('business_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Bidding Management
  async placeBid(bidData: CreateBidDto): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert([bidData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTraderBids(traderId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('bidder_id', traderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Order Management
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTraderOrders(traderId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('trader_id', traderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Appointment Management
  async createAppointment(appointmentData: CreateAppointmentDto): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

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

  // Market Analysis
  async getMarketTrends() {
    const { data, error } = await supabase
      .from('market_trends')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Dashboard Statistics
  async getTraderStats(traderId: string) {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('user_id', traderId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 