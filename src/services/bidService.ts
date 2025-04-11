import { supabase } from '../lib/supabase';
import { Bid, CreateBidDto, UpdateBidDto } from '../types/bid';

export const bidService = {
  async createBid(bid: CreateBidDto): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert([bid])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBidById(id: string): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getFarmerBids(farmerId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('bidder_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateBid(id: string, updates: UpdateBidDto): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBid(id: string): Promise<void> {
    const { error } = await supabase
      .from('bids')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .eq('is_highest_bid', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    return data;
  },

  async acceptBid(id: string): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectBid(id: string): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 