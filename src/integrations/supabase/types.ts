export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auctions: {
        Row: {
          id: string
          product_id: string
          farmer_id: string
          start_price: number
          current_price: number
          reserve_price: number
          min_increment: number
          quantity: number
          start_time: string
          end_time: string
          description: string
          auction_type: string
          allow_auto_bids: boolean
          visibility: string
          shipping_options: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          farmer_id: string
          start_price: number
          current_price: number
          reserve_price: number
          min_increment: number
          quantity: number
          start_time: string
          end_time: string
          description: string
          auction_type: string
          allow_auto_bids: boolean
          visibility: string
          shipping_options: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          farmer_id?: string
          start_price?: number
          current_price?: number
          reserve_price?: number
          min_increment?: number
          quantity?: number
          start_time?: string
          end_time?: string
          description?: string
          auction_type?: string
          allow_auto_bids?: boolean
          visibility?: string
          shipping_options?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auctions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auctions_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          settings: {
            email: {
              bids: boolean
              orders: boolean
              shipments: boolean
              pricingAlerts: boolean
              appointments: boolean
              promotions: boolean
            }
            push: {
              bids: boolean
              orders: boolean
              shipments: boolean
              pricingAlerts: boolean
              appointments: boolean
              promotions: boolean
            }
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings: {
            email: {
              bids: boolean
              orders: boolean
              shipments: boolean
              pricingAlerts: boolean
              appointments: boolean
              promotions: boolean
            }
            push: {
              bids: boolean
              orders: boolean
              shipments: boolean
              pricingAlerts: boolean
              appointments: boolean
              promotions: boolean
            }
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings?: {
            email: {
              bids: boolean
              orders: boolean
              shipments: boolean
              pricingAlerts: boolean
              appointments: boolean
              promotions: boolean
            }
            push: {
              bids: boolean
              orders: boolean
              shipments: boolean
              pricingAlerts: boolean
              appointments: boolean
              promotions: boolean
            }
          }
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          bidder_name: string
          created_at: string
          id: string
          message: string | null
          product_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          bidder_id: string
          bidder_name: string
          created_at?: string
          id?: string
          message?: string | null
          product_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          bidder_name?: string
          created_at?: string
          id?: string
          message?: string | null
          product_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      market_rates: {
        Row: {
          avg_price: number
          created_at: string
          date: string
          id: string
          location: string
          market: string
          max_price: number
          min_price: number
          product_name: string
          unit: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          avg_price: number
          created_at?: string
          date: string
          id?: string
          location: string
          market: string
          max_price: number
          min_price: number
          product_name: string
          unit: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          avg_price?: number
          created_at?: string
          date?: string
          id?: string
          location?: string
          market?: string
          max_price?: number
          min_price?: number
          product_name?: string
          unit?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          farmer_id: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_status: string
          price: number
          product_id: string
          quantity: number
          status: string
          total_amount: number
          trader_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          farmer_id: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          price: number
          product_id: string
          quantity: number
          status?: string
          total_amount: number
          trader_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          farmer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string
          price?: number
          product_id?: string
          quantity?: number
          status?: string
          total_amount?: number
          trader_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          additional_images: string[] | null
          category: string
          created_at: string
          description: string | null
          farmer_id: string
          farmer_name: string
          id: string
          image_url: string | null
          location: string
          name: string
          price: number
          quality: string
          quantity: number
          status: string
          unit: string
          updated_at: string
          auction_id: string | null
        }
        Insert: {
          additional_images?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          farmer_id: string
          farmer_name: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          price: number
          quality: string
          quantity: number
          status?: string
          unit: string
          updated_at?: string
          auction_id?: string | null
        }
        Update: {
          additional_images?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          farmer_id?: string
          farmer_name?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          price?: number
          quality?: string
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
          auction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_farmer_id_fkey",
            columns: ["farmer_id"],
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          address: string | null
          business_details: Json | null
          city: string | null
          created_at: string
          farm_details: Json | null
          id: string
          name: string
          phone: string | null
          pincode: string | null
          role: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_details?: Json | null
          city?: string | null
          created_at?: string
          farm_details?: Json | null
          id: string
          name: string
          phone?: string | null
          pincode?: string | null
          role: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_details?: Json | null
          city?: string | null
          created_at?: string
          farm_details?: Json | null
          id?: string
          name?: string
          phone?: string | null
          pincode?: string | null
          role?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          id: string
          order_id: string
          farmer_id: string
          trader_id: string
          tracking_number: string
          status: string
          current_location: string | null
          estimated_delivery: string | null
          created_at: string
          updated_at: string
          dispatched_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          farmer_id: string
          trader_id: string
          tracking_number: string
          status?: string
          current_location?: string | null
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
          dispatched_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          farmer_id?: string
          trader_id?: string
          tracking_number?: string
          status?: string
          current_location?: string | null
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
          dispatched_at?: string | null
          delivered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
