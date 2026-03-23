/**
 * ============================================================
 * Service Requêtes - Dream Team Mobile
 * Endpoints : /api/v1/requests/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  PageResponse,
  RequestResponse,
  CreateRequestRequest,
} from '../types';

const REQUESTS_BASE = '/requests';

/**
 * Crée une nouvelle requête
 */
export const createRequest = async (
  data: CreateRequestRequest
): Promise<ApiResponse<RequestResponse>> => {
  const response = await apiClient.post(REQUESTS_BASE, data);
  return response.data;
};

/**
 * Récupère les requêtes d'un membre
 */
export const getMemberRequests = async (
  memberId: string,
  page = 0,
  size = 20
): Promise<ApiResponse<PageResponse<RequestResponse>>> => {
  const response = await apiClient.get(`${REQUESTS_BASE}/member/${memberId}`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * Récupère le détail d'une requête
 */
export const getRequestById = async (id: string): Promise<ApiResponse<RequestResponse>> => {
  const response = await apiClient.get(`${REQUESTS_BASE}/${id}`);
  return response.data;
};
