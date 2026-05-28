export type Role = 'ADMIN' | 'MEMBER' | 'ASPIRANT';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'INACTIVE' | 'EXCLUDED';
export type PaymentType = 'INSCRIPTION' | 'ASSURANCE' | 'SANCTION' | 'TONTINE' | 'EPARGNE' | 'AUTRE';
export type PaymentMode = 'ESPECE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'BANQUE' | 'AUTRE';
export type PaymentStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'CANCELLED';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'ANSWERED' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type RequestType = 'GENERAL' | 'INFORMATION' | 'COMPLAINT' | 'WITHDRAWAL_SAVINGS';
export type SanctionType = 'RETARD' | 'ABSENCE' | 'NON_PAIEMENT' | 'AUTRE';
export type TontineFrequency =
  | 'HEBDOMADAIRE'
  | 'BI-HEBDOMADAIRE'
  | 'MENSUELLE'
  | 'BIMENSUELLE'
  | 'TRIMESTRIELLE'
  | 'SEMESTRIELLE'
  | 'ANNUELLE';

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
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
  user: UserResponse;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  telephone?: string;
  role?: Role;
}

export interface UpdateProfileRequest {
  nom?: string;
  prenoms?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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

export interface MemberResponse {
  id: string;
  matricule?: string;
  cni?: string;
  nom: string;
  prenoms: string;
  fullName?: string;
  telephone: string;
  quartier?: string;
  status: MemberStatus;
  userId?: string;
  associationId?: string;
  inscriptionDate?: string;
  createdAt?: string;
  updatedAt?: string;
  insuranceSummary?: {
    paidAmount: number;
    totalAmount: number;
    progressPercentage: number;
    isComplete: boolean;
  };
  activeSubscriptions?: number;
  pendingSanctions?: number;
}

export interface MemberFinancialStatusResponse {
  memberId: string;
  memberName: string;
  matricule: string;
  insuranceStatus?: {
    paidAmount: number;
    totalAmount: number;
    remainingAmount: number;
    progressPercentage: number;
    isComplete: boolean;
  };
  pendingRequests: number;
  answeredRequests: number;
  totalSanctionsUnpaid: number;
  totalSanctionsPaid: number;
}

export interface MemberDashboardResponse {
  savingsBalance?: number;
  totalSavings?: number;
  insurancePaid?: number;
  insuranceTotal?: number;
  insuranceProgress?: number;
  insuranceComplete?: boolean;
  activeSubscriptions?: number;
  unpaidSanctions?: number;
  pendingSanctions?: number;
  pendingRequests?: number;
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

export interface TontineResponse {
  id: string;
  denomination: string;
  nom?: string;
  periodicite: TontineFrequency;
  dateDebut: string;
  dateFin: string;
  jourButoir: number;
  montantCotisation: number;
  montantPart?: number;
  sanctionNonBeneficiee: number;
  sanctionDejaBeneficiee: number;
  isActive: boolean;
  isLocked: boolean;
  associationId?: string;
  createdAt?: string;
  updatedAt?: string;
  totalPeriods: number;
  currentPeriod: number;
  totalSubscriptions: number;
  totalCotisationsExpected: number;
  totalCotisationsReceived: number;
}

export interface SubscriptionResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule?: string;
  tontineId: string;
  tontineName: string;
  subscriptionName: string;
  multiplier: number;
  periodOrder?: number;
  isActive: boolean;
  hasBenefited: boolean;
  benefitDate?: string;
  createdAt?: string;
}

export interface JoinTontineRequest {
  subscriptionName?: string;
  multiplier?: number;
  preferredOrder?: number;
}

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
  createdAt?: string;
  updatedAt?: string;
  paymentProof?: string;
  proofUrl?: string;
  memberId?: string;
  memberName: string;
  memberMatricule?: string;
  phoneNumber?: string;
  campayReference?: string;
  campayPaymentUrl?: string;
  rejectionReason?: string;
}

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

export enum SavingsType {
  SCOLAIRE = 'SCOLAIRE',
  PROJET = 'PROJET',
  ANNUELLE = 'ANNUELLE',
  AUTRE = 'AUTRE',
}

export interface SavingsResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule?: string;
  denomination: string;
  balance: number;
  solde?: number;
  isActive: boolean;
  typeEpargne: SavingsType;
  description?: string;
  createdAt: string;
  dateOuverture?: string;
}

export interface SavingsSummaryResponse {
  memberId: string;
  totalBalance: number;
  accountCount?: number;
  totalAccounts?: number;
  activeAccounts: number;
  lastDepositAmount?: number;
  lastDepositDate?: string;
}

export interface SavingsTransactionResponse {
  id: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PENALTY';
  amount: number;
  description?: string;
  transactionDate: string;
  reference?: string;
}

export interface SanctionResponse {
  id: string;
  memberId: string;
  memberName: string;
  memberMatricule?: string;
  dateSanction: string;
  motif: string;
  type?: SanctionType;
  montant: number;
  montantPaye?: number;
  remainingAmount?: number;
  isPaid: boolean;
  status?: string;
  datePaiement?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestRequest {
  motif: string;
  description: string;
  solutionSouhaitee?: string;
  requestType?: RequestType;
  relatedEntityId?: string;
  amount?: number;
}

export interface RequestResponse {
  id: string;
  memberId?: string;
  memberName?: string;
  memberMatricule?: string;
  dateRequete?: string;
  motif?: string;
  sujet?: string;
  description: string;
  solutionSouhaitee?: string;
  requestType?: RequestType;
  relatedEntityId?: string;
  amount?: number;
  status: RequestStatus;
  reponse?: string;
  reponseAdmin?: string;
  respondedBy?: string;
  respondedByName?: string;
  responseDate?: string;
  createdAt?: string;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
  type?: string;
  relatedEntityId?: string;
}
