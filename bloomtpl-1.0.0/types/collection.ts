export interface Collection {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  highlight_label?: string;
  is_featured: boolean;
  active: boolean;
}
