/**
 * ============================================================
 * Service Paiements - Dream Team Mobile
 * Endpoints : /api/v1/payments/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  PageResponse,
  PaymentResponse,
  CreatePaymentRequest,
  PaymentMode,
} from '../types';

const PAYMENTS_BASE = '/payments';

/**
 * Crée un nouveau paiement
 */
export const createPayment = async (
  data: CreatePaymentRequest
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await apiClient.post(PAYMENTS_BASE, data);
  return response.data;
};

/**
 * Lance le paiement CamPay des frais d'adhésion pendant l'inscription.
 */
export const initiateMembershipPayment = async (
  phoneNumber: string,
  mode: PaymentMode
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await apiClient.post(`${PAYMENTS_BASE}/membership/initiate`, null, {
    params: { phoneNumber, mode },
  });
  return response.data;
};

/**
 * Récupère les paiements d'un membre
 */
export const getMemberPayments = async (
  memberId: string,
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<PaymentResponse>>> => {
  const response = await apiClient.get(`${PAYMENTS_BASE}/member/${memberId}`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * Récupère les détails d'un paiement
 */
export const getPaymentById = async (id: string): Promise<ApiResponse<PaymentResponse>> => {
  const response = await apiClient.get(`${PAYMENTS_BASE}/${id}`);
  return response.data;
};

/**
 * Récupère tous les paiements (admin)
 */
export const getAllPayments = async (
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<PaymentResponse>>> => {
  const response = await apiClient.get(PAYMENTS_BASE, { params: { page, size } });
  return response.data;
};

/**
 * Récupère les paiements en attente (admin)
 */
export const getPendingPayments = async (
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<PaymentResponse>>> => {
  const response = await apiClient.get(`${PAYMENTS_BASE}/pending`, { params: { page, size } });
  return response.data;
};

/**
 * Synchronise le statut CamPay d'un paiement en attente (validation automatique si payé)
 */
export const syncCampayPayment = async (
  paymentId: string
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await apiClient.post(`${PAYMENTS_BASE}/${paymentId}/sync-campay`);
  return response.data;
};
