/**
 * ============================================================
 * Service Tontines - Dream Team Mobile
 * Endpoints : /api/v1/tontines/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  JoinTontineRequest,
  PageResponse,
  SubscriptionResponse,
  TontineResponse,
} from '../types';

const TONTINES_BASE = '/tontines';

/**
 * Récupère toutes les tontines
 */
export const getAllTontines = async (
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<TontineResponse>>> => {
  const response = await apiClient.get(TONTINES_BASE, { params: { page, size } });
  return response.data;
};

/**
 * Récupère les tontines actives
 */
export const getActiveTontines = async (
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<TontineResponse>>> => {
  const response = await apiClient.get(`${TONTINES_BASE}/active`, { params: { page, size } });
  return response.data;
};

/**
 * Récupère les tontines ouvertes à l'adhésion
 */
export const getAvailableTontines = async (
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<TontineResponse>>> => {
  const response = await apiClient.get(`${TONTINES_BASE}/available`, { params: { page, size } });
  return response.data;
};

/**
 * Récupère les détails d'une tontine
 */
export const getTontineById = async (id: string): Promise<ApiResponse<TontineResponse>> => {
  const response = await apiClient.get(`${TONTINES_BASE}/${id}`);
  return response.data;
};

/**
 * Souscrire à une tontine
 */
export const subscribeToTontine = async (
  tontineId: string,
  data: JoinTontineRequest
): Promise<ApiResponse<SubscriptionResponse>> => {
  const response = await apiClient.post(`${TONTINES_BASE}/${tontineId}/join`, data);
  return response.data;
};

/**
 * Récupère les souscriptions du membre connecté
 */
export const getMySubscriptions = async (): Promise<ApiResponse<SubscriptionResponse[]>> => {
  const response = await apiClient.get(`${TONTINES_BASE}/me/subscriptions`);
  return response.data;
};
