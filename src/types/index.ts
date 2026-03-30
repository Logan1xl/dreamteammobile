/**
 * ============================================================
 * Types Globaux - Dream Team Mobile Frontend
 * Alignés avec le backend et le frontend web.
 * Supporte les alias pour une compatibilité maximale.
 * ==================== ENUMS ====================
 */

export type Role = 'ADMIN' | 'MEMBER' | 'ASPIRANT';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'INACTIVE' | 'EXCLUDED';
export type PaymentType = 'INSCRIPTION' | 'ASSURANCE' | 'SANCTION' | 'TONTINE' | 'EPARGNE' | 'AUTRE';
export type PaymentMode = 'ESPECE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'BANQUE' | 'AUTRE';
export type PaymentStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'CANCELLED';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TontineFrequency = 'HEBDOMADAIRE' | 'MENSUELLE' | 'TRIMESTRIELLE';

// ==================== API ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

// ==================== AUTH ====================

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  nom: string;
  prenoms: string;
  telephone: string;
  roles?: Role[];
  role?: Role;
  memberId?: string;
  memberMatricule?: string;
  imageUrl?: string;
}

// ==================== DASHBOARD MEMBER ====================

export interface MemberDashboardResponse {
  totalSavings: number;
  activeSubscriptions: number;
  insurancePaid: boolean;
  pendingSanctions: number;
  nextTontineDate?: string;
  nextTontineAmount?: number;
}

export interface AdminDashboardResponse {
  totalMembers: number;
  activeMembers: number;
  pendingApplications: number;
  activeTontines: number;
  pendingPayments: number;
  pendingRequests: number;
  totalSavings: number;
}

// ==================== TONTINES ====================

export interface TontineResponse {
  id: string;
  denomination?: string;
  nom?: string;
  periodicite: TontineFrequency;
  montantCotisation?: number;
  montantPart?: number;
  isActive: boolean;
  isLocked: boolean;
  totalSubscriptions?: number;
  totalCotisationsReceived?: number;
  dateDebut?: string;
}

// ==================== PAIEMENTS ====================

export interface PaymentResponse {
  id: string;
  typePaiement?: PaymentType;
  type?: PaymentType;
  modePaiement?: PaymentMode;
  mode?: PaymentMode;
  montant?: number;
  amount?: number;
  status: PaymentStatus;
  paymentDate?: string;
  dateCreation?: string;
  paymentProof?: string;
  proofUrl?: string;
  memberName: string;
  rejectionReason?: string;
}

// ==================== ÉPARGNE ====================

export interface SavingsResponse {
  id: string;
  balance?: number;
  solde?: number;
  isActive?: boolean;
  createdAt?: string;
}

// ==================== REQUÊTES ====================

export interface RequestResponse {
  id: string;
  motif?: string;
  sujet?: string;
  description: string;
  status: RequestStatus;
  reponse?: string;
  reponseAdmin?: string;
  createdAt?: string;
}
