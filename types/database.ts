export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      partners: {
        Row: {
          id: string
          name: string
          contact_name: string
          email: string
          phone: string | null
          slug: string
          city: string | null
          state: string | null
          stripe_customer_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['partners']['Insert']>
      }
      families: {
        Row: {
          id: string
          partner_id: string
          token: string
          deceased_name: string
          deceased_dod: string | null
          deceased_state: string | null
          contact_name: string
          contact_email: string | null
          contact_phone: string
          intake_completed: boolean
          tasks_generated: boolean
          stripe_payment_intent_id: string | null
          amount_charged_cents: number
          paid_at: string | null
          activated_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['families']['Row'], 'id' | 'created_at' | 'updated_at' | 'activated_at'>
        Update: Partial<Database['public']['Tables']['families']['Insert']>
      }
      intake_responses: {
        Row: {
          id: string
          family_id: string
          section: string
          key: string
          value: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['intake_responses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['intake_responses']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          family_id: string
          category: 'government' | 'property' | 'finance' | 'daily' | 'veteran' | 'business' | 'foreign'
          title: string
          description: string
          why_it_matters: string | null
          urgency: 'urgent' | 'normal' | 'low'
          deadline_days: number | null
          deadline_date: string | null
          status: 'pending' | 'in_progress' | 'done' | 'skipped' | 'not_applicable'
          sort_order: number
          letter_subject: string | null
          letter_body: string | null
          letter_variables: Json | null
          gov_form_name: string | null
          gov_form_url: string | null
          states_relevant: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      reminders: {
        Row: {
          id: string
          family_id: string
          task_id: string | null
          type: 'sms' | 'email'
          message: string
          scheduled_for: string
          sent_at: string | null
          status: 'pending' | 'sent' | 'failed' | 'cancelled'
          error_message: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>
      }
      partner_users: {
        Row: {
          id: string
          user_id: string
          partner_id: string
          role: 'admin' | 'staff'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partner_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['partner_users']['Insert']>
      }
    }
  }
}

// Convenience types
export type Partner = Database['public']['Tables']['partners']['Row']
export type Family = Database['public']['Tables']['families']['Row']
export type IntakeResponse = Database['public']['Tables']['intake_responses']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Reminder = Database['public']['Tables']['reminders']['Row']
export type PartnerUser = Database['public']['Tables']['partner_users']['Row']
