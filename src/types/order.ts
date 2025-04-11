export interface Order {
  id: string;
  product_id: string;
  trader_id: string;
  farmer_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipping_address: string;
}

export interface CreateOrderDto {
  product_id: string;
  quantity: number;
  price: number;
  shipping_address: string;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: string;
  payment_status?: string;
  payment_date?: string;
  delivery_date?: string;
  notes?: string;
} 