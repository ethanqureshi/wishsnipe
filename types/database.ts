export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          steam_id: string
          name: string
          avatar: string
          alert_email: string | null
          created_at: string
        }
        Insert: {
          steam_id: string
          name: string
          avatar: string
          alert_email?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          avatar?: string
          alert_email?: string | null
        }
      }
      games: {
        Row: {
          appid: number
          name: string
          header_image: string
          is_free: boolean
          updated_at: string
        }
        Insert: {
          appid: number
          name: string
          header_image: string
          is_free?: boolean
          updated_at?: string
        }
        Update: {
          name?: string
          header_image?: string
          is_free?: boolean
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          steam_id: string
          appid: number
          priority: number
          date_added: number
          alert_threshold_price: number | null
          alert_threshold_pct: number | null
          created_at: string
        }
        Insert: {
          id?: string
          steam_id: string
          appid: number
          priority?: number
          date_added?: number
          alert_threshold_price?: number | null
          alert_threshold_pct?: number | null
          created_at?: string
        }
        Update: {
          priority?: number
          alert_threshold_price?: number | null
          alert_threshold_pct?: number | null
        }
      }
      price_snapshots: {
        Row: {
          id: string
          appid: number
          current_price: number | null
          original_price: number | null
          discount_percent: number
          is_free: boolean
          captured_at: string
        }
        Insert: {
          id?: string
          appid: number
          current_price?: number | null
          original_price?: number | null
          discount_percent?: number
          is_free?: boolean
          captured_at?: string
        }
        Update: never
      }
      historical_lows: {
        Row: {
          appid: number
          itad_id: string
          low_price: number
          low_cut: number
          low_shop: string
          low_date: string | null
          updated_at: string
        }
        Insert: {
          appid: number
          itad_id: string
          low_price: number
          low_cut: number
          low_shop: string
          low_date?: string | null
          updated_at?: string
        }
        Update: {
          itad_id?: string
          low_price?: number
          low_cut?: number
          low_shop?: string
          low_date?: string | null
          updated_at?: string
        }
      }
    }
  }
}
