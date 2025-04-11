import { supabase } from '../lib/supabase';
import { Auction, CreateAuctionDto, UpdateAuctionDto } from '../types/auction';

export const auctionService = {
  async createAuction(auction: CreateAuctionDto): Promise<Auction> {
    const { data, error } = await supabase
      .from('auctions')
      .insert([auction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAuctionById(id: string): Promise<Auction> {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getFarmerAuctions(farmerId: string): Promise<Auction[]> {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateAuction(id: string, updates: UpdateAuctionDto): Promise<Auction> {
    const { data, error } = await supabase
      .from('auctions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAuction(id: string): Promise<void> {
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getActiveAuctions(): Promise<Auction[]> {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async endAuction(id: string): Promise<Auction> {
    const { data, error } = await supabase
      .from('auctions')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 