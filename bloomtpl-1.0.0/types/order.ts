/**
 * Tipos e Interfaces para Pedidos
 * Borbô - E-commerce de Roupas
 */

import { CartItem } from './cart';
import { Address } from './user';

// Status do pedido
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded'
  | 'returned';

// Status de pagamento
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'approved' 
  | 'declined' 
  | 'refunded' 
  | 'cancelled';

// Método de pagamento
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'boleto' 
  | 'pix' 
  | 'paypal' 
  | 'wallet';

// Método de entrega
export type ShippingMethod = 
  | 'standard' 
  | 'express' 
  | 'scheduled';

// Informações de pagamento
export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  
  // Dados de cartão (se aplicável)
  cardLast4?: string;
  cardBrand?: string;
  
  // IDs de transação
  transactionId?: string;
  authorizationCode?: string;
  
  // Datas
  processedAt?: Date;
  authorizedAt?: Date;
}

// Informações de envio
export interface ShippingInfo {
  method: ShippingMethod;
  carrier?: string;
  trackingNumber?: string;
  
  // Endereços
  shippingAddress: Address;
  billingAddress: Address;
  
  // Custos e prazos
  cost: number;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  // Status
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
  shippedAt?: Date;
}

// Item do pedido (snapshot do produto no momento da compra)
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  
  // Preço no momento da compra
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discount?: number;
  
  // Configurações
  selectedSize: string;
  selectedColor: string;
  
  // Status de entrega individual
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

// Desconto/Cupom aplicado
export interface OrderDiscount {
  type: 'coupon' | 'promotional' | 'loyalty';
  code?: string;
  description?: string;
  amount: number;
  percentage?: number;
}

// Pedido completo
export interface Order {
  id: string;
  orderNumber: string; // Número amigável do pedido
  
  // Cliente
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Itens
  items: OrderItem[];
  itemCount: number;
  
  // Totais
  subtotal: number;
  discounts: OrderDiscount[];
  totalDiscount: number;
  tax: number;
  shippingCost: number;
  total: number;
  
  // Pagamento
  paymentInfo: PaymentInfo;
  
  // Envio
  shippingInfo: ShippingInfo;
  
  // Status
  status: OrderStatus;
  notes?: string;
  cancelReason?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  processedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  // Histórico
  statusHistory?: OrderStatusHistory[];
}

// Histórico de mudanças de status
export interface OrderStatusHistory {
  status: OrderStatus;
  changedAt: Date;
  changedBy: string; // user_id do admin que fez a mudança
  reason?: string;
  notes?: string;
}

// Requisição para criar pedido
export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

// Resposta após criar pedido
export interface OrderResponse {
  order: Order;
  redirectUrl?: string; // URL para pagamento se necessário
}

// Filtros para listar pedidos
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
  search?: string;
}

// Resultado de listagem de pedidos
export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Resumo de pedido para notificação por email
export interface OrderEmailSummary {
  orderNumber: string;
  total: number;
  itemCount: number;
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
}
