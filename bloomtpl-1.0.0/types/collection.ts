export interface Collection {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured: boolean;
  active: boolean;
}