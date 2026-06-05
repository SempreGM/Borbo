/**
 * Tipos e Interfaces para Usuário e Autenticação
 * Borbô - E-commerce de Roupas
 */

// Roles de usuário
export type UserRole = 'customer' | 'admin' | 'moderator';

// Status da conta
export type AccountStatus = 'active' | 'suspended' | 'deleted' | 'pending_verification';

// Endereço do usuário
export interface Address {
  id: string;
  userId: string;
  type: 'billing' | 'shipping';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

// Preferências do usuário
export interface UserPreferences {
  newsletter: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
}

// Usuário autenticado
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  surname?: string;
  phone?: string;
  avatar?: string;
  
  // Dados pessoais
  birthDate?: Date;
  cpf?: string; // Cadastro de Pessoa Física (Brasil)
  
  // Dados de endereço
  addresses?: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  
  // Preferências
  preferences: UserPreferences;
  
  // Informações de conta
  role: UserRole;
  status: AccountStatus;
  
  // Dados estatísticos
  totalOrders: number;
  totalSpent: number;
  
  // Wishlist / Favoritos
  favorites?: string[]; // IDs de produtos
  
  // Dados de sistema
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Usuário para registro/cadastro
export interface UserSignUp {
  email: string;
  name: string;
  surname?: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  agreeToTerms: boolean;
}

// Usuário para login
export interface UserSignIn {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Dados para atualizar perfil
export interface UserUpdateProfile {
  name?: string;
  surname?: string;
  phone?: string;
  avatar?: string;
  birthDate?: Date;
  preferences?: Partial<UserPreferences>;
}

// Resposta de autenticação
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Sessão do usuário
export interface UserSession {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

// Dados para recuperação de senha
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}
