/**
 * ============================================================
 * Service Tontines - Dream Team Mobile
 * Endpoints : /api/v1/tontines/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  PageResponse,
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
  memberId: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`${TONTINES_BASE}/subscribe`, { tontineId, memberId });
  return response.data;
};
