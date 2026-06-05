/**
 * Tipos e Interfaces para Produtos de Moda Feminina
 * borbô - E-commerce de Roupas
 */

// Tamanhos disponíveis para roupas femininas
export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

// Categorias de produtos
export type ProductCategory = 
  | 'camisetas'
  | 'vestidos'
  | 'calças'
  | 'saias'
  | 'jaquetas'
  | 'suéteres'
  | 'blusas'
  | 'macaquinhos'
  | 'acessórios';

// Status de disponibilidade
export type AvailabilityStatus = 'available' | 'low_stock' | 'out_of_stock' | 'discontinued';

// Variação de cor com estoque
export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image: string;
  sizes: Record<ClothingSize, number>; // Estoque por tamanho
}

// Variação de tamanho com informações
export interface SizeInfo {
  size: ClothingSize;
  stock: number;
  colors: ProductColor[];
}

// Avaliação de cliente
export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  helpfulCount: number;
}

// Produto principal
export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number; // Preço original se estiver em desconto
  discount?: number; // Percentual de desconto
  category: ProductCategory;
  subcategory?: string;
  
  // Imagens
  images: string[]; // Array de URLs
  thumbnail?: string;
  
  // Variações
  colors: ProductColor[];
  availableSizes: ClothingSize[];
  
  // Características
  material?: string;
  composition?: string; // Ex: "100% Algodão"
  care?: string[]; // Cuidados de limpeza
  tags?: string[];
  
  // Avaliações
  reviews?: ProductReview[];
  rating: number; // 1-5
  reviewCount: number;
  
  // Status
  status: AvailabilityStatus;
  totalStock: number;
  
  // Dados de sistema
  createdAt: Date;
  updatedAt: Date;
  sku: string; // Stock Keeping Unit
  
  // SEO
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Produto para exibição em listagem
export interface ProductPreview {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  status: AvailabilityStatus;
  slug: string;
}

// Filtros de busca
export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sizes?: ClothingSize[];
  colors?: string[];
  minRating?: number;
  inStock?: boolean;
  search?: string;
}

// Resultado de busca paginado
export interface ProductSearchResult {
  products: ProductPreview[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
