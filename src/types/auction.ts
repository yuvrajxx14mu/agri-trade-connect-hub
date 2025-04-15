export interface Bid {
  id: string;
  bidder_id: string;
  bidder_name: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'outbid';
  created_at: string;
  updated_at: string;
}

export interface Auction {
  id: string;
  product_id: string;
  farmer_id: string;
  start_price: number;
  current_price: number;
  reserve_price: number | null;
  min_increment: number | null;
  quantity: number;
  start_time: string;
  end_time: string;
  description: string | null;
  auction_type: string;
  allow_auto_bids: boolean;
  visibility: string;
  shipping_options: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuctionWithBids extends Auction {
  bids: Bid[];
}

export interface CreateAuctionDto {
  product_id: string;
  farmer_id: string;
  start_price: number;
  current_price: number;
  reserve_price?: number;
  min_increment?: number;
  quantity: number;
  start_time: string;
  end_time: string;
  description?: string;
  auction_type?: string;
  allow_auto_bids?: boolean;
  visibility?: string;
  shipping_options?: string;
  status?: string;
}

export interface UpdateAuctionDto {
  product_id?: string;
  farmer_id?: string;
  start_price?: number;
  current_price?: number;
  reserve_price?: number | null;
  min_increment?: number | null;
  quantity?: number;
  start_time?: string;
  end_time?: string;
  description?: string | null;
  auction_type?: string;
  allow_auto_bids?: boolean;
  visibility?: string;
  shipping_options?: string;
  status?: string;
} 