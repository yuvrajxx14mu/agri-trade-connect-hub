export interface Bid {
  id: string;
  product_id: string;
  bidder_id: string;
  bidder_name: string;
  amount: number;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  auction_id: string;
  quantity: number;
  is_highest_bid: boolean;
  previous_bid_amount: number | null;
  expires_at: string;
  auction_end_time: string;
}

export interface CreateBidDto {
  product_id: string;
  amount: number;
  message?: string;
  auction_id: string;
  quantity: number;
}

export interface UpdateBidDto {
  amount?: number;
  message?: string;
  status?: string;
  is_highest_bid?: boolean;
} 