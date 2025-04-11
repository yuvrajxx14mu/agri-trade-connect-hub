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

export interface CreateAuctionDto {
  product_id: string;
  start_price: number;
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
}

export interface UpdateAuctionDto {
  start_price?: number;
  reserve_price?: number;
  min_increment?: number;
  quantity?: number;
  end_time?: string;
  description?: string;
  status?: string;
} 