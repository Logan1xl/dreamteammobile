/**
 * ============================================================
 * Service Sanctions - Dream Team Mobile
 * Endpoints : /api/v1/sanctions/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  PageResponse,
  SanctionResponse,
} from '../types';

const SANCTIONS_BASE = '/sanctions';

/**
 * Récupère les sanctions d'un membre
 */
export const getMemberSanctions = async (
  memberId: string,
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<SanctionResponse>>> => {
  const response = await apiClient.get(`${SANCTIONS_BASE}/member/${memberId}`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * Récupère les détails d'une sanction
 */
export const getSanctionById = async (id: string): Promise<ApiResponse<SanctionResponse>> => {
  const response = await apiClient.get(`${SANCTIONS_BASE}/${id}`);
  return response.data;
};
