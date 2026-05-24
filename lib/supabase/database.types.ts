export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          aadhaar: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'completed'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          aadhaar?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'completed'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          aadhaar?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'completed'
        }
      }
      schemes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_id: string
          monthly_amount: number
          total_months: number
          months_paid: number
          start_date: string
          maturity_date: string
          status: 'active' | 'completed' | 'cancelled'
          silver_rate_at_start: number
          total_silver_grams: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id: string
          monthly_amount: number
          total_months: number
          months_paid?: number
          start_date: string
          maturity_date: string
          status?: 'active' | 'completed' | 'cancelled'
          silver_rate_at_start: number
          total_silver_grams: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id?: string
          monthly_amount?: number
          total_months?: number
          months_paid?: number
          start_date?: string
          maturity_date?: string
          status?: 'active' | 'completed' | 'cancelled'
          silver_rate_at_start?: number
          total_silver_grams?: number
          notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          scheme_id: string
          due_date: string
          paid_date: string | null
          amount: number
          status: 'pending' | 'paid' | 'overdue'
          payment_method: string | null
          receipt_number: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          scheme_id: string
          due_date: string
          paid_date?: string | null
          amount: number
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string | null
          receipt_number?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          scheme_id?: string
          due_date?: string
          paid_date?: string | null
          amount?: number
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string | null
          receipt_number?: string | null
          notes?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          key: string
          value: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          key: string
          value: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          key?: string
          value?: string
          description?: string | null
        }
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
  }
}