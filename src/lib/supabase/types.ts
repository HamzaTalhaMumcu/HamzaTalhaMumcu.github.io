export type Project = {
  id: string;
  user_id: string;
  name: string;
  product_url: string | null;
  product_description: string | null;
  ad_request: string | null;
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
