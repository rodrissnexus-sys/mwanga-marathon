
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "banner_packages": {
                  Row: {
                    "banner_id": number,"category": string,"created_at": string,"event_id": number,"features_en": (string)[],"features_sw": (string)[],"id": number,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "banner_id": number,"category": string,"created_at"?: string,"event_id": number,"features_en"?: (string)[],"features_sw"?: (string)[],"id"?: number,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "banner_id"?: number,"category"?: string,"created_at"?: string,"event_id"?: number,"features_en"?: (string)[],"features_sw"?: (string)[],"id"?: number,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "banner_packages_banner_id_fkey"
      columns: ["banner_id"]
isOneToOne: false
      referencedRelation: "marathon_banners"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "banner_packages_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"collection_venues": {
                  Row: {
                    "address": string | null,"created_at": string,"description_en": string | null,"description_sw": string | null,"id": number,"is_active": boolean,"name_en": string,"name_sw": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"created_at"?: string,"description_en"?: string | null,"description_sw"?: string | null,"id"?: number,"is_active"?: boolean,"name_en": string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"created_at"?: string,"description_en"?: string | null,"description_sw"?: string | null,"id"?: number,"is_active"?: boolean,"name_en"?: string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"contact_messages": {
                  Row: {
                    "company": string | null,"created_at": string,"email": string,"handled_at": string | null,"handled_by": string | null,"handled_by_name": string | null,"id": number,"kind": Database["public"]['Enums']["message_kind"],"locale": Database["public"]['Enums']["app_locale"],"message": string,"name": string,"phone": string | null,"sponsorship_tier": string | null,"subject": string | null,"updated_at": string,"website": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "company"?: string | null,"created_at"?: string,"email": string,"handled_at"?: string | null,"handled_by"?: string | null,"handled_by_name"?: string | null,"id"?: number,"kind": Database["public"]['Enums']["message_kind"],"locale"?: Database["public"]['Enums']["app_locale"],"message": string,"name": string,"phone"?: string | null,"sponsorship_tier"?: string | null,"subject"?: string | null,"updated_at"?: string,"website"?: string | null
                  }
                  Update: {
                    "company"?: string | null,"created_at"?: string,"email"?: string,"handled_at"?: string | null,"handled_by"?: string | null,"handled_by_name"?: string | null,"id"?: number,"kind"?: Database["public"]['Enums']["message_kind"],"locale"?: Database["public"]['Enums']["app_locale"],"message"?: string,"name"?: string,"phone"?: string | null,"sponsorship_tier"?: string | null,"subject"?: string | null,"updated_at"?: string,"website"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "contact_messages_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"countries": {
                  Row: {
                    "code": string,"created_at": string,"id": number,"is_active": boolean,"name_en": string,"name_sw": string | null,"nationality_en": string | null,"nationality_sw": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: number,"is_active"?: boolean,"name_en": string,"name_sw"?: string | null,"nationality_en"?: string | null,"nationality_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: number,"is_active"?: boolean,"name_en"?: string,"name_sw"?: string | null,"nationality_en"?: string | null,"nationality_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"event_features": {
                  Row: {
                    "created_at": string,"event_type_id": number,"icon": string,"id": number,"is_active": boolean,"sort_order": number,"text_en": string,"text_sw": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"event_type_id": number,"icon": string,"id"?: number,"is_active"?: boolean,"sort_order"?: number,"text_en": string,"text_sw"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"event_type_id"?: number,"icon"?: string,"id"?: number,"is_active"?: boolean,"sort_order"?: number,"text_en"?: string,"text_sw"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_features_event_type_id_fkey"
      columns: ["event_type_id"]
isOneToOne: false
      referencedRelation: "event_types"
      referencedColumns: ["id"]
    }
                  ]
                },"event_types": {
                  Row: {
                    "color": string,"created_at": string,"description_en": string,"description_sw": string | null,"highlight_en": string | null,"highlight_sw": string | null,"icon": string,"id": number,"image": string | null,"is_active": boolean,"slug": string,"sort_order": number,"subtitle_en": string,"subtitle_sw": string | null,"title_en": string,"title_sw": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color": string,"created_at"?: string,"description_en": string,"description_sw"?: string | null,"highlight_en"?: string | null,"highlight_sw"?: string | null,"icon": string,"id"?: number,"image"?: string | null,"is_active"?: boolean,"slug": string,"sort_order"?: number,"subtitle_en": string,"subtitle_sw"?: string | null,"title_en": string,"title_sw"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "color"?: string,"created_at"?: string,"description_en"?: string,"description_sw"?: string | null,"highlight_en"?: string | null,"highlight_sw"?: string | null,"icon"?: string,"id"?: number,"image"?: string | null,"is_active"?: boolean,"slug"?: string,"sort_order"?: number,"subtitle_en"?: string,"subtitle_sw"?: string | null,"title_en"?: string,"title_sw"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"events": {
                  Row: {
                    "created_at": string,"description_en": string | null,"description_sw": string | null,"distance_km": number | null,"foreign_price": number,"id": number,"is_active": boolean,"is_kids_event": boolean,"local_kids_price": number,"local_price": number,"name_en": string,"name_sw": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description_en"?: string | null,"description_sw"?: string | null,"distance_km"?: number | null,"foreign_price"?: number,"id"?: number,"is_active"?: boolean,"is_kids_event"?: boolean,"local_kids_price"?: number,"local_price"?: number,"name_en": string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description_en"?: string | null,"description_sw"?: string | null,"distance_km"?: number | null,"foreign_price"?: number,"id"?: number,"is_active"?: boolean,"is_kids_event"?: boolean,"local_kids_price"?: number,"local_price"?: number,"name_en"?: string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"genders": {
                  Row: {
                    "code": string,"created_at": string,"id": number,"is_active": boolean,"name_en": string,"name_sw": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: number,"is_active"?: boolean,"name_en": string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: number,"is_active"?: boolean,"name_en"?: string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"marathon_banners": {
                  Row: {
                    "created_at": string,"event_date": string,"id": number,"is_active": boolean,"location_en": string,"location_sw": string | null,"max_participants": number,"registration_end_date": string,"registration_start_date": string,"start_time": string,"subtitle_en": string | null,"subtitle_sw": string | null,"title_en": string,"title_sw": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"event_date": string,"id"?: number,"is_active"?: boolean,"location_en": string,"location_sw"?: string | null,"max_participants": number,"registration_end_date": string,"registration_start_date": string,"start_time": string,"subtitle_en"?: string | null,"subtitle_sw"?: string | null,"title_en": string,"title_sw"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"event_date"?: string,"id"?: number,"is_active"?: boolean,"location_en"?: string,"location_sw"?: string | null,"max_participants"?: number,"registration_end_date"?: string,"registration_start_date"?: string,"start_time"?: string,"subtitle_en"?: string | null,"subtitle_sw"?: string | null,"title_en"?: string,"title_sw"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"newsletter_subscribers": {
                  Row: {
                    "created_at": string,"email": string,"id": number,"locale": Database["public"]['Enums']["app_locale"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: number,"locale"?: Database["public"]['Enums']["app_locale"]
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: number,"locale"?: Database["public"]['Enums']["app_locale"]
                  }
                  Relationships: [
                    
                  ]
                },"payment_events": {
                  Row: {
                    "actor_id": string | null,"actor_name": string | null,"amount": number | null,"created_at": string,"currency": string | null,"id": number,"method": Database["public"]['Enums']["payment_method"] | null,"notes": string | null,"previous_status": Database["public"]['Enums']["payment_status"] | null,"reference": string | null,"registration_id": number,"status": Database["public"]['Enums']["payment_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_id"?: string | null,"actor_name"?: string | null,"amount"?: number | null,"created_at"?: string,"currency"?: string | null,"id"?: number,"method"?: Database["public"]['Enums']["payment_method"] | null,"notes"?: string | null,"previous_status"?: Database["public"]['Enums']["payment_status"] | null,"reference"?: string | null,"registration_id": number,"status": Database["public"]['Enums']["payment_status"]
                  }
                  Update: {
                    "actor_id"?: string | null,"actor_name"?: string | null,"amount"?: number | null,"created_at"?: string,"currency"?: string | null,"id"?: number,"method"?: Database["public"]['Enums']["payment_method"] | null,"notes"?: string | null,"previous_status"?: Database["public"]['Enums']["payment_status"] | null,"reference"?: string | null,"registration_id"?: number,"status"?: Database["public"]['Enums']["payment_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_events_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payment_events_registration_id_fkey"
      columns: ["registration_id"]
isOneToOne: false
      referencedRelation: "registrations"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"name": string,"role": Database["public"]['Enums']["app_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id": string,"name": string,"role": Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"name"?: string,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rate_limits": {
                  Row: {
                    "hits": number,"key": string,"window_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "hits"?: number,"key": string,"window_start": string
                  }
                  Update: {
                    "hits"?: number,"key"?: string,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"registrations": {
                  Row: {
                    "collection_venue_id": number,"country_id": number,"created_at": string,"date_of_birth": string,"deleted_at": string | null,"email": string,"emergency_contact_name": string,"emergency_contact_number": string,"event_id": number,"first_name": string,"gender_id": number,"id": number,"id_number": string | null,"kids_shirt_size_id": number | null,"last_name": string,"locale": Database["public"]['Enums']["app_locale"],"nationality_category": string | null,"nationality_id": number,"participant_category": string | null,"passport_number": string | null,"payment_amount": number | null,"payment_confirmed_at": string | null,"payment_confirmed_by": string | null,"payment_confirmed_by_name": string | null,"payment_currency": string | null,"payment_method": Database["public"]['Enums']["payment_method"] | null,"payment_notes": string | null,"payment_reference": string | null,"payment_status": Database["public"]['Enums']["payment_status"],"phone_number": string,"postal_code": string | null,"registration_id": string,"search_text": string | null,"shirt_size_id": number,"updated_at": string,"voucher_code": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_venue_id": number,"country_id": number,"created_at"?: string,"date_of_birth": string,"deleted_at"?: string | null,"email": string,"emergency_contact_name": string,"emergency_contact_number": string,"event_id": number,"first_name": string,"gender_id": number,"id"?: number,"id_number"?: string | null,"kids_shirt_size_id"?: number | null,"last_name": string,"locale"?: Database["public"]['Enums']["app_locale"],"nationality_category"?: string | null,"nationality_id": number,"participant_category"?: string | null,"passport_number"?: string | null,"payment_amount"?: number | null,"payment_confirmed_at"?: string | null,"payment_confirmed_by"?: string | null,"payment_confirmed_by_name"?: string | null,"payment_currency"?: string | null,"payment_method"?: Database["public"]['Enums']["payment_method"] | null,"payment_notes"?: string | null,"payment_reference"?: string | null,"payment_status"?: Database["public"]['Enums']["payment_status"],"phone_number": string,"postal_code"?: string | null,"registration_id"?: string,"search_text"?: never,"shirt_size_id": number,"updated_at"?: string,"voucher_code"?: string | null
                  }
                  Update: {
                    "collection_venue_id"?: number,"country_id"?: number,"created_at"?: string,"date_of_birth"?: string,"deleted_at"?: string | null,"email"?: string,"emergency_contact_name"?: string,"emergency_contact_number"?: string,"event_id"?: number,"first_name"?: string,"gender_id"?: number,"id"?: number,"id_number"?: string | null,"kids_shirt_size_id"?: number | null,"last_name"?: string,"locale"?: Database["public"]['Enums']["app_locale"],"nationality_category"?: string | null,"nationality_id"?: number,"participant_category"?: string | null,"passport_number"?: string | null,"payment_amount"?: number | null,"payment_confirmed_at"?: string | null,"payment_confirmed_by"?: string | null,"payment_confirmed_by_name"?: string | null,"payment_currency"?: string | null,"payment_method"?: Database["public"]['Enums']["payment_method"] | null,"payment_notes"?: string | null,"payment_reference"?: string | null,"payment_status"?: Database["public"]['Enums']["payment_status"],"phone_number"?: string,"postal_code"?: string | null,"registration_id"?: string,"search_text"?: never,"shirt_size_id"?: number,"updated_at"?: string,"voucher_code"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "registrations_collection_venue_id_fkey"
      columns: ["collection_venue_id"]
isOneToOne: false
      referencedRelation: "collection_venues"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_country_id_fkey"
      columns: ["country_id"]
isOneToOne: false
      referencedRelation: "countries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_gender_id_fkey"
      columns: ["gender_id"]
isOneToOne: false
      referencedRelation: "genders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_kids_shirt_size_id_fkey"
      columns: ["kids_shirt_size_id"]
isOneToOne: false
      referencedRelation: "shirt_sizes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_nationality_id_fkey"
      columns: ["nationality_id"]
isOneToOne: false
      referencedRelation: "countries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_payment_confirmed_by_fkey"
      columns: ["payment_confirmed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "registrations_shirt_size_id_fkey"
      columns: ["shirt_size_id"]
isOneToOne: false
      referencedRelation: "shirt_sizes"
      referencedColumns: ["id"]
    }
                  ]
                },"schedule_days": {
                  Row: {
                    "created_at": string,"date_en": string,"date_sw": string | null,"day_en": string,"day_identifier": string | null,"day_sw": string | null,"id": number,"is_active": boolean,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"date_en": string,"date_sw"?: string | null,"day_en": string,"day_identifier"?: string | null,"day_sw"?: string | null,"id"?: number,"is_active"?: boolean,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"date_en"?: string,"date_sw"?: string | null,"day_en"?: string,"day_identifier"?: string | null,"day_sw"?: string | null,"id"?: number,"is_active"?: boolean,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"schedule_events": {
                  Row: {
                    "created_at": string,"description_en": string,"description_sw": string | null,"icon": string,"id": number,"is_active": boolean,"location_en": string,"location_sw": string | null,"schedule_day_id": number,"sort_order": number,"time_en": string,"time_sw": string | null,"title_en": string,"title_sw": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description_en": string,"description_sw"?: string | null,"icon": string,"id"?: number,"is_active"?: boolean,"location_en": string,"location_sw"?: string | null,"schedule_day_id": number,"sort_order"?: number,"time_en": string,"time_sw"?: string | null,"title_en": string,"title_sw"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description_en"?: string,"description_sw"?: string | null,"icon"?: string,"id"?: number,"is_active"?: boolean,"location_en"?: string,"location_sw"?: string | null,"schedule_day_id"?: number,"sort_order"?: number,"time_en"?: string,"time_sw"?: string | null,"title_en"?: string,"title_sw"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "schedule_events_schedule_day_id_fkey"
      columns: ["schedule_day_id"]
isOneToOne: false
      referencedRelation: "schedule_days"
      referencedColumns: ["id"]
    }
                  ]
                },"shirt_sizes": {
                  Row: {
                    "code": string,"created_at": string,"id": number,"is_active": boolean,"is_kids_size": boolean,"name_en": string,"name_sw": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"id"?: number,"is_active"?: boolean,"is_kids_size"?: boolean,"name_en": string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"id"?: number,"is_active"?: boolean,"is_kids_size"?: boolean,"name_en"?: string,"name_sw"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "hit_rate_limit":
{ Args: { "p_key": string,"p_max": number,"p_window_seconds": number }; Returns: boolean
                           }
          }
          Enums: {
            "app_locale": "en"|"sw","app_role": "admin"|"moderator","message_kind": "contact"|"partnership"|"volunteer","payment_method": "mobile_money"|"bank_transfer"|"cash"|"other","payment_status": "pending"|"confirmed"|"failed"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "app_locale": ["en", "sw"],"app_role": ["admin", "moderator"],"message_kind": ["contact", "partnership", "volunteer"],"payment_method": ["mobile_money", "bank_transfer", "cash", "other"],"payment_status": ["pending", "confirmed", "failed"]
          }
        }
} as const
