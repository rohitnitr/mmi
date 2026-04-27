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
      users: {
        Row: {
          id: string
          username: string
          experience: string
          coffee_balance: number
          created_at: string
          last_active: string
        }
        Insert: {
          id?: string
          username: string
          experience?: string
          coffee_balance?: number
          created_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          username?: string
          experience?: string
          coffee_balance?: number
          created_at?: string
          last_active?: string
        }
      }
      invites: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'expired' | 'rejected'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'expired' | 'rejected'
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'expired' | 'rejected'
          created_at?: string
          expires_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: 'active' | 'completed'
          start_time: string
          end_time: string | null
          channel_name: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status?: 'active' | 'completed'
          start_time?: string
          end_time?: string | null
          channel_name?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: 'active' | 'completed'
          start_time?: string
          end_time?: string | null
          channel_name?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'debit' | 'credit'
          amount: number
          reason: 'invite' | 'refund' | 'topup'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'debit' | 'credit'
          amount: number
          reason: 'invite' | 'refund' | 'topup'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'debit' | 'credit'
          amount?: number
          reason?: 'invite' | 'refund' | 'topup'
          created_at?: string
        }
      }
    }
  }
}
