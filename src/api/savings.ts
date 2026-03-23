/**
 * ============================================================
 * Service Épargne - Dream Team Mobile
 * Endpoints : /api/v1/savings/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  SavingsResponse,
  SavingsSummaryResponse,
} from '../types';

const SAVINGS_BASE = '/savings';

/**
 * Récupère les comptes d'épargne d'un membre
 */
export const getMemberSavings = async (
  memberId: string
): Promise<ApiResponse<SavingsResponse[]>> => {
  const response = await apiClient.get(`${SAVINGS_BASE}/member/${memberId}`);
  return response.data;
};

/**
 * Récupère le détail d'un compte d'épargne
 */
export const getSavingsById = async (id: string): Promise<ApiResponse<SavingsResponse>> => {
  const response = await apiClient.get(`${SAVINGS_BASE}/${id}`);
  return response.data;
};

/**
 * Récupère le résumé d'épargne d'un membre
 */
export const getMemberSavingsSummary = async (
  memberId: string
): Promise<ApiResponse<SavingsSummaryResponse>> => {
  const response = await apiClient.get(`${SAVINGS_BASE}/member/${memberId}/summary`);
  return response.data;
};
