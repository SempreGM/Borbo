/**
 * Índice de Tipos TypeScript
 * Borbô - E-commerce de Roupas
 * 
 * Exporta todos os tipos e interfaces do projeto
 */

// Tipos de Produto
export type {
  ClothingSize,
  ProductCategory,
  AvailabilityStatus,
  ProductColor,
  SizeInfo,
  ProductReview,
  Product,
  ProductPreview,
  ProductFilters,
  ProductSearchResult,
} from './product';

// Tipos de Usuário
export type {
  UserRole,
  AccountStatus,
  Address,
  UserPreferences,
  User,
  UserSignUp,
  UserSignIn,
  UserUpdateProfile,
  AuthResponse,
  UserSession,
  PasswordResetRequest,
  PasswordReset,
} from './user';

// Tipos de Carrinho
export type {
  CartItem,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  ApplyCouponRequest,
  CouponResponse,
  CartSummary,
  CartState,
} from './cart';

// Tipos de Pedido
export type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
  PaymentInfo,
  ShippingInfo,
  OrderItem,
  OrderDiscount,
  Order,
  OrderStatusHistory,
  CreateOrderRequest,
  OrderResponse,
  OrderFilters,
  OrderListResult,
  OrderEmailSummary,
} from './order';
