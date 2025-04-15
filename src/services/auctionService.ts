import { supabase } from '@/integrations/supabase/client';
import { Auction, AuctionWithBids, CreateAuctionDto, UpdateAuctionDto } from '../types/auction';

export const auctionService = {
  async createAuction(auction: CreateAuctionDto): Promise<Auction> {
    const { data, error } = await supabase
      .from('auctions')
      .insert(auction)
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
      .update({ status: 'ended' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkAndUpdateAuctionStatuses(): Promise<void> {
    try {
      // Get all active auctions that have passed their end time
      const { data: endedAuctions, error: fetchError } = await supabase
        .from('auctions')
        .select(`
          *,
          bids!auction_id(
            id,
            amount,
            bidder_id,
            bidder_name,
            status,
            created_at,
            updated_at
          )
        `)
        .eq('status', 'active')
        .lt('end_time', new Date().toISOString()) as { data: AuctionWithBids[] | null, error: any };

      if (fetchError) throw fetchError;

      // Process each ended auction
      for (const auction of endedAuctions || []) {
        // Find the highest bid
        const bids = auction.bids || [];
        const highestBid = bids.length > 0 
          ? bids.reduce((prev, current) => 
              (prev.amount > current.amount) ? prev : current
            )
          : null;

        // Update auction status
        const { error: updateError } = await supabase
          .from('auctions')
          .update({ 
            status: 'ended',
            updated_at: new Date().toISOString()
          })
          .eq('id', auction.id);

        if (updateError) throw updateError;

        if (highestBid) {
          // Accept the highest bid
          const { error: bidError } = await supabase
            .from('bids')
            .update({
              status: 'accepted',
              updated_at: new Date().toISOString()
            })
            .eq('id', highestBid.id);

          if (bidError) throw bidError;

          // Reject all other bids
          const { error: otherBidsError } = await supabase
            .from('bids')
            .update({
              status: 'rejected',
              updated_at: new Date().toISOString()
            })
            .eq('auction_id', auction.id)
            .neq('id', highestBid.id);

          if (otherBidsError) throw otherBidsError;

          // Create an order for the winning bid
          const { error: orderError } = await supabase
            .from('orders')
            .insert({
              product_id: auction.product_id,
              farmer_id: auction.farmer_id,
              trader_id: highestBid.bidder_id,
              quantity: auction.quantity,
              price: highestBid.amount,
              total_amount: highestBid.amount * auction.quantity,
              status: 'pending',
              payment_status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (orderError) throw orderError;
        }
      }
    } catch (error) {
      console.error('Error updating auction statuses:', error);
      throw error;
    }
  }
}; 