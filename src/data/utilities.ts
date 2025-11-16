export interface Utility {
  id: string;
  name: string;
  description: string;
  download_url: string;
  image_url: string | null;
  ordem: number | null; // Mantido como null para flexibilidade, mas não será usado no formulário
  created_at: string | null;
  updated_at: string | null;
  hidden_info?: string | null; // Adicionado
}

export const utilities: Utility[] = []; // Dados agora virão do Supabase