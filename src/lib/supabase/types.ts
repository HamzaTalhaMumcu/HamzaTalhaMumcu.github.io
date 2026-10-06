export type Project = {
  id: string;
  user_id: string;
  name: string;
  product_url: string | null;
  product_description: string | null;
  ad_request: string | null;
  competitors: string[];
  created_at: string;
  updated_at: string;
};

export type ProductAnalysis = {
  id: string;
  project_id: string;
  user_id: string;
  result: {
    summary: string;
    audience: string;
    painPoints: string[];
    promise: string;
    positioning: string;
    differentiators: string[];
    competitorInsights?: string[];
  };
  status: "draft" | "complete" | "failed";
  created_at: string;
  updated_at: string;
};

export type AdvertisingStrategy = {
  id: string;
  project_id: string;
  user_id: string;
  result: {
    objective: string;
    channels: string[];
    messagingPillars: string[];
    creativeDirections: string[];
    adAngles: string[];
  };
  created_at: string;
  updated_at: string;
};

export type AdVariant = {
  id: string;
  project_id: string;
  user_id: string;
  kind: "hook" | "copy";
  content: Record<string, string>;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  status: "draft" | "ready" | "archived";
  objective: string | null;
  strategy_snapshot: Record<string, unknown>;
  creative_snapshot: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
};

export type CampaignAdSet = {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  targeting_notes: string | null;
  created_at: string;
};

export type CampaignAd = {
  id: string;
  ad_set_id: string;
  user_id: string;
  kind: "hook" | "copy";
  content: Record<string, string>;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      ai_usage: {
        Row: { user_id: string; period_start: string; generations: number };
        Insert: { user_id: string; period_start?: string; generations?: number };
        Update: Partial<{ period_start: string; generations: number }>;
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          category: "general" | "bug" | "feature" | "improvement";
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          category?: "general" | "bug" | "feature" | "improvement";
          message: string;
          created_at?: string;
        };
        Update: Partial<{
          category: "general" | "bug" | "feature" | "improvement";
          message: string;
        }>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          brand_name: string | null;
          brand_description: string | null;
          brand_voice: string | null;
          brand_values: string | null;
          preferred_words: string | null;
          avoid_words: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          brand_name?: string | null;
          brand_description?: string | null;
          brand_voice?: string | null;
          brand_values?: string | null;
          preferred_words?: string | null;
          avoid_words?: string | null;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["profiles"]["Insert"], "id">>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
          cancelled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
          cancelled?: boolean;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["subscriptions"]["Insert"], "id" | "user_id">>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Project, "id" | "user_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Campaign, "id" | "project_id" | "user_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      campaign_ad_sets: {
        Row: CampaignAdSet;
        Insert: Omit<CampaignAdSet, "id" | "created_at">;
        Update: Partial<Omit<CampaignAdSet, "id" | "campaign_id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      campaign_ads: {
        Row: CampaignAd;
        Insert: Omit<CampaignAd, "id" | "created_at">;
        Update: Partial<Omit<CampaignAd, "id" | "ad_set_id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      product_analyses: { Row: ProductAnalysis; Insert: Omit<ProductAnalysis, "id" | "created_at" | "updated_at">; Update: Partial<Omit<ProductAnalysis, "id" | "project_id" | "user_id" | "created_at" | "updated_at">>; Relationships: [] };
      advertising_strategies: { Row: AdvertisingStrategy; Insert: Omit<AdvertisingStrategy, "id" | "created_at" | "updated_at">; Update: Partial<Omit<AdvertisingStrategy, "id" | "project_id" | "user_id" | "created_at" | "updated_at">>; Relationships: [] };
      ad_variants: { Row: AdVariant; Insert: Omit<AdVariant, "id" | "created_at" | "updated_at">; Update: Partial<Omit<AdVariant, "id" | "project_id" | "user_id" | "created_at" | "updated_at">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      consume_ai_generation: {
        Args: { p_user_id: string; p_limit?: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
