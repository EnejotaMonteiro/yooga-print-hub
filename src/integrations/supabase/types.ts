export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      balancas_utilitarios: {
        Row: {
          created_at: string | null
          description: string
          download_url: string
          hidden_info: string | null
          id: string
          image_url: string | null
          name: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          download_url: string
          hidden_info?: string | null
          id?: string
          image_url?: string | null
          name: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          download_url?: string
          hidden_info?: string | null
          id?: string
          image_url?: string | null
          name?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracao_site: {
        Row: {
          id: string
          logo_full_url: string | null
          logo_login_url: string | null
          logo_min_url: string | null
          scales_page_content: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          logo_full_url?: string | null
          logo_login_url?: string | null
          logo_min_url?: string | null
          scales_page_content?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          logo_full_url?: string | null
          logo_login_url?: string | null
          logo_min_url?: string | null
          scales_page_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impressoras: {
        Row: {
          ativo: boolean | null
          conexao_rede: boolean | null
          created_at: string | null
          download_url: string
          id: string
          imagem_url: string
          nome: string
          ordem: number | null
          updated_at: string | null
          video_url: string
          windows_recomendado: string | null
        }
        Insert: {
          ativo?: boolean | null
          conexao_rede?: boolean | null
          created_at?: string | null
          download_url: string
          id?: string
          imagem_url: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
          video_url: string
          windows_recomendado?: string | null
        }
        Update: {
          ativo?: boolean | null
          conexao_rede?: boolean | null
          created_at?: string | null
          download_url?: string
          id?: string
          imagem_url?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
          video_url?: string
          windows_recomendado?: string | null
        }
        Relationships: []
      }
      mensagens_chat: {
        Row: {
          conteudo: string
          cor_usuario: string | null
          criado_em: string | null
          id: string
          impressora_id: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          cor_usuario?: string | null
          criado_em?: string | null
          id?: string
          impressora_id: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          cor_usuario?: string | null
          criado_em?: string | null
          id?: string
          impressora_id?: string
          usuario_id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          foto_url: string | null
          id: string
          nome: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          foto_url?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      scale_processes: {
        Row: {
          button_text: string
          content: string
          created_at: string | null
          id: string
          ordem: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          button_text: string
          content: string
          created_at?: string | null
          id?: string
          ordem?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          button_text?: string
          content?: string
          created_at?: string | null
          id?: string
          ordem?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sugestoes: {
        Row: {
          conteudo_sugestao: string
          created_at: string | null
          id: string
          nome_remetente: string | null
        }
        Insert: {
          conteudo_sugestao: string
          created_at?: string | null
          id?: string
          nome_remetente?: string | null
        }
        Update: {
          conteudo_sugestao?: string
          created_at?: string | null
          id?: string
          nome_remetente?: string | null
        }
        Relationships: []
      }
      tutoriais: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string
          id: string
          ordem: number | null
          titulo: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao: string
          id?: string
          ordem?: number | null
          titulo: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string
          id?: string
          ordem?: number | null
          titulo?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      utilitarios: {
        Row: {
          created_at: string | null
          description: string
          download_url: string
          hidden_info: string | null
          id: string
          image_url: string | null
          name: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          download_url: string
          hidden_info?: string | null
          id?: string
          image_url?: string | null
          name: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          download_url?: string
          hidden_info?: string | null
          id?: string
          image_url?: string | null
          name?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const
