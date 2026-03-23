/**
 * ============================================================
 * Types TypeScript - Dream Team Mobile
 * Correspondent aux DTOs du backend Spring Boot
 * ============================================================
 */

// ==================== ENUMS ====================

/** Rôles utilisateur */
export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  ASPIRANT = 'ASPIRANT',
}

/** Statuts d'un membre */
export enum MemberStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
  EXCLUDED = 'EXCLUDED',
}

/** Modes de paiement */
export enum PaymentMode {
  ESPECE = 'ESPECE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  BANQUE = 'BANQUE',
  AUTRE = 'AUTRE',
}

/** Types de paiement */
export enum PaymentType {
  INSCRIPTION = 'INSCRIPTION',
  ASSURANCE = 'ASSURANCE',
  SANCTION = 'SANCTION',
  TONTINE = 'TONTINE',
  EPARGNE = 'EPARGNE',
  AUTRE = 'AUTRE',
}

/** Statuts de paiement */
export enum PaymentStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/** Statuts de requête */
export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

/** Types de sanctions */
export enum SanctionType {
  RETARD = 'RETARD',
  ABSENCE = 'ABSENCE',
  NON_PAIEMENT = 'NON_PAIEMENT',
  AUTRE = 'AUTRE',
}

/** Types d'épargne */
export enum SavingsType {
  EPARGNE_LIBRE = 'EPARGNE_LIBRE',
  EPARGNE_BLOQUEE = 'EPARGNE_BLOQUEE',
}

/** Fréquence des tontines */
export enum TontineFrequency {
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUELLE = 'MENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
}

// ==================== RÉPONSE API GÉNÉRIQUE ====================

/** Enveloppe de réponse API standard du backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

/** Réponse paginée Spring */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ==================== AUTH ====================

/** Requête de connexion */
export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

/** Requête d'inscription */
export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  role?: Role;
}

/** Réponse d'authentification */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

/** Données utilisateur */
export interface UserResponse {
  id: string;
  email: string;
  nom: string;
  prenoms: string;
  telephone: string;
  roles: Role[];
  memberId?: string;
  memberMatricule?: string;
  imageUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
}

/** Requête de mise à jour du profil */
export interface UpdateProfileRequest {
  nom?: string;
  prenoms?: string;
  phone?: string;
}

/** Requête de changement de mot de passe */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== MEMBRES ====================

/** Résumé assurance d'un membre */
export interface InsuranceSummary {
  paidAmount: number;
  totalAmount: number;
  progressPercentage: number;
  isComplete: boolean;
}

/** Données d'un membre */
export interface MemberResponse {
  id: string;
  matricule: string;
  cni: string;
  nom: string;
  prenoms: string;
  fullName: string;
  telephone: string;
  quartier: string;
  status: MemberStatus;
  inscriptionDate: string;
  userId: string;
  associationId: string;
  createdAt: string;
  updatedAt: string;
  insuranceSummary?: InsuranceSummary;
  activeSubscriptions: number;
  pendingSanctions: number;
}

// ==================== DASHBOARD ====================

/** Dashboard membre */
export interface MemberDashboardResponse {
  memberId: string;
  memberName: string;
  matricule: string;
  insurancePaid: number;
  insuranceTotal: number;
  insuranceProgress: number;
  canReceiveHelp: boolean;
  savingsBalance: number;
  unpaidSanctions: number;
  pendingRequests: number;
}

/** Dashboard admin */
export interface AdminDashboardResponse {
  totalMembers: number;
  activeMembers: number;
  pendingApplications: number;
  activeTontines: number;
  pendingPayments: number;
  pendingRequests: number;
  totalInsuranceCollected: number;
  totalSavings: number;
}

// ==================== PAIEMENTS ====================

/** Requête de création de paiement */
export interface CreatePaymentRequest {
  memberId: string;
  typePaiement: PaymentType;
  modePaiement: PaymentMode;
  lieu: string;
  montant: number;
  paymentProof?: string;
  relatedEntityId?: string;
  phoneNumber?: string;
}

/** Réponse paiement */
export interface PaymentResponse {
  id: string;
  typePaiement: PaymentType;
  modePaiement: PaymentMode;
  lieu: string;
  montant: number;
  currency: string;
  paymentProof?: string;
  paymentDate: string;
  status: PaymentStatus;
  memberId: string;
  memberName: string;
  memberMatricule: string;
  validatedAt?: string;
  validatedBy?: string;
  validatedByName?: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber?: string;
  campayReference?: string;
}

// ==================== TONTINES ====================

/** Réponse tontine */
export interface TontineResponse {
  id: string;
  denomination: string;
  periodicite: TontineFrequency;
  dateDebut: string;
  dateFin: string;
  jourButoir: number;
  montantCotisation: number;
  sanctionNonBeneficiee: number;
  sanctionDejaBeneficiee: number;
  isActive: boolean;
  isLocked: boolean;
  associationId: string;
  createdAt: string;
  updatedAt: string;
  totalPeriods: number;
  currentPeriod: number;
  totalSubscriptions: number;
  totalCotisationsExpected: number;
  totalCotisationsReceived: number;
}

/** Souscription à une tontine */
export interface SubscribeToTontineRequest {
  tontineId: string;
  memberId: string;
}

// ==================== ÉPARGNE ====================

/** Réponse épargne */
export interface SavingsResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule: string;
  denomination: string;
  typeEpargne: SavingsType;
  description: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Résumé épargne */
export interface SavingsSummaryResponse {
  totalBalance: number;
  totalAccounts: number;
  activeAccounts: number;
}

// ==================== SANCTIONS ====================

/** Réponse sanction */
export interface SanctionResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule: string;
  dateSanction: string;
  motif: string;
  type: SanctionType;
  montant: number;
  montantPaye: number;
  remainingAmount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== REQUÊTES ====================

/** Requête de création de demande */
export interface CreateRequestRequest {
  motif: string;
  description: string;
  solutionSouhaitee?: string;
}

/** Réponse requête */
export interface RequestResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule: string;
  dateRequete: string;
  motif: string;
  description: string;
  solutionSouhaitee?: string;
  status: RequestStatus;
  reponse?: string;
  respondedBy?: string;
  respondedByName?: string;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ASSOCIATION ====================

/** Réponse association */
export interface AssociationResponse {
  id: string;
  nom: string;
  description: string;
  siege: string;
  dateCreation: string;
  fraisInscription: number;
  cotisationAssurance: number;
  orangeMoneyAccount?: string;
  mtnMomoAccount?: string;
  bankAccount?: string;
}
