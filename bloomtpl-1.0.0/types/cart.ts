/**
 * Tipos e Interfaces para Carrinho de Compras
 * borbô - E-commerce de Roupas
 */

import { Product } from './product';
import { ClothingSize } from './product';

// Item do carrinho
export interface CartItem {
  id: string; // ID único do item no carrinho
  productId: string;
  product?: Product; // Dados completos do produto (opcional)
  
  // Seleções do cliente
  selectedSize: ClothingSize;
  selectedColor: string; // ID ou nome da cor
  quantity: number;
  
  // Preço e totais
  price: number; // Preço unitário no momento da adição
  subtotal: number; // price * quantity
  
  // Informações adicionais
  addedAt: Date;
  lastUpdated: Date;
}

// Carrinho do usuário
export interface Cart {
  id: string;
  userId: string;
  
  // Itens
  items: CartItem[];
  itemCount: number; // Quantidade total de itens
  totalQuantity: number; // Soma das quantidades (pode ser diferente se houver múltiplas variações do mesmo produto)
  
  // Totais
  subtotal: number; // Soma dos subtotals
  discount: number; // Desconto aplicado (cupom)
  tax: number; // Impostos
  shippingCost: number; // Custo de envio
  total: number; // Total final
  
  // Cupom/Promoção
  couponCode?: string;
  couponDiscount?: number;
  
  // Dados de sistema
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;
  
  // Flags
  isAbandoned?: boolean; // Carrinho abandonado
}

// Requisição para adicionar item ao carrinho
export interface AddToCartRequest {
  productId: string;
  selectedSize: ClothingSize;
  selectedColor: string;
  quantity: number;
}

// Requisição para atualizar item do carrinho
export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity?: number;
  selectedSize?: ClothingSize;
  selectedColor?: string;
}

// Requisição para aplicar cupom
export interface ApplyCouponRequest {
  code: string;
  cartId: string;
}

// Resposta de cupom aplicado
export interface CouponResponse {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minPurchase?: number;
  expiresAt: Date;
  discountAmount: number;
}

// Resumo do carrinho para checkout
export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
}

// Estado do carrinho para sincronização
export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  lastSync: Date;
}
