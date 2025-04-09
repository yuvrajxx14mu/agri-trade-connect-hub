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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          farmer_id: string
          id: string
          location: string
          status: string
          title: string
          trader_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          farmer_id: string
          id?: string
          location: string
          status: string
          title: string
          trader_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          farmer_id?: string
          id?: string
          location?: string
          status?: string
          title?: string
          trader_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          allow_auto_bids: boolean | null
          auction_type: string | null
          created_at: string | null
          current_price: number
          description: string | null
          end_time: string
          farmer_id: string | null
          id: string
          min_increment: number | null
          product_id: string | null
          quantity: number
          reserve_price: number | null
          shipping_options: string | null
          start_price: number
          start_time: string
          status: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          allow_auto_bids?: boolean | null
          auction_type?: string | null
          created_at?: string | null
          current_price: number
          description?: string | null
          end_time: string
          farmer_id?: string | null
          id?: string
          min_increment?: number | null
          product_id?: string | null
          quantity: number
          reserve_price?: number | null
          shipping_options?: string | null
          start_price: number
          start_time: string
          status?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          allow_auto_bids?: boolean | null
          auction_type?: string | null
          created_at?: string | null
          current_price?: number
          description?: string | null
          end_time?: string
          farmer_id?: string | null
          id?: string
          min_increment?: number | null
          product_id?: string | null
          quantity?: number
          reserve_price?: number | null
          shipping_options?: string | null
          start_price?: number
          start_time?: string
          status?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
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
          },
        ]
      }
      business_details: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          business_type: string
          business_website: string | null
          created_at: string | null
          gst_number: string | null
          id: string
          registration_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          business_type: string
          business_website?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          registration_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          business_type?: string
          business_website?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          registration_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metric_type: string
          period: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          metric_type: string
          period: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metric_type?: string
          period?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      disputes: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          raised_against: string
          raised_by: string
          reason: string
          resolution: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          raised_against: string
          raised_by: string
          reason: string
          resolution?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          raised_against?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          expiry_date: string | null
          file_url: string
          id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expiry_date?: string | null
          file_url: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expiry_date?: string | null
          file_url?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      farm_details: {
        Row: {
          created_at: string | null
          farm_address: string
          farm_email: string | null
          farm_name: string
          farm_phone: string | null
          farm_size: number
          farm_size_unit: string
          farm_type: string
          id: string
          irrigation_type: string | null
          soil_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          farm_address: string
          farm_email?: string | null
          farm_name: string
          farm_phone?: string | null
          farm_size: number
          farm_size_unit?: string
          farm_type: string
          id?: string
          irrigation_type?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          farm_address?: string
          farm_email?: string | null
          farm_name?: string
          farm_phone?: string | null
          farm_size?: number
          farm_size_unit?: string
          farm_type?: string
          id?: string
          irrigation_type?: string | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          pincode: string | null
          state: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          pincode?: string | null
          state: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          pincode?: string | null
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      market_rates: {
        Row: {
          avg_price: number
          created_at: string
          date: string
          id: string
          location: string
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
          market?: string
          max_price?: number
          min_price?: number
          product_name?: string
          unit?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_rates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
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
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_date: string | null
          payment_method: string
          status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_date?: string | null
          payment_method: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_date?: string | null
          payment_method?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string | null
          id: string
          product_name: string
          status: string
          target_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string | null
          id?: string
          product_name: string
          status?: string
          target_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string | null
          id?: string
          product_name?: string
          status?: string
          target_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_images: string[] | null
          auction_id: string | null
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          farmer_id: string
          farmer_name: string
          id: string
          image_url: string | null
          location: string
          location_id: string | null
          name: string
          price: number
          quality: string
          quantity: number
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          auction_id?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          farmer_id: string
          farmer_name: string
          id?: string
          image_url?: string | null
          location: string
          location_id?: string | null
          name: string
          price: number
          quality: string
          quantity: number
          status?: string
          unit: string
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          auction_id?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          farmer_id?: string
          farmer_name?: string
          id?: string
          image_url?: string | null
          location?: string
          location_id?: string | null
          name?: string
          price?: number
          quality?: string
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
          name?: string
          phone?: string | null
          pincode?: string | null
          role?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_standards: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          parameters: Json
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parameters: Json
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parameters?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_standards_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          period: string
          report_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          period: string
          report_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          period?: string
          report_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          order_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          carrier: string
          created_at: string | null
          current_location: string | null
          destination: string
          dispatch_date: string | null
          estimated_delivery: string | null
          farmer_id: string
          id: string
          notes: string | null
          order_id: string
          status: string
          tracking_number: string
          trader_id: string
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          carrier: string
          created_at?: string | null
          current_location?: string | null
          destination: string
          dispatch_date?: string | null
          estimated_delivery?: string | null
          farmer_id: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
          tracking_number: string
          trader_id: string
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          carrier?: string
          created_at?: string | null
          current_location?: string | null
          destination?: string
          dispatch_date?: string | null
          estimated_delivery?: string | null
          farmer_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
          tracking_number?: string
          trader_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          compact_view: boolean | null
          created_at: string | null
          dark_mode: boolean | null
          id: string
          two_factor_auth: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compact_view?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          id?: string
          two_factor_auth?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compact_view?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          id?: string
          two_factor_auth?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          currency: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          currency?: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          currency?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
