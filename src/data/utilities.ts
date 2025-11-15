export interface Utility {
  id: string;
  name: string;
  description: string;
  download_url: string;
  image_url: string | null;
  ordem: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const utilities: Utility[] = []; // Dados agora virão do Supabase