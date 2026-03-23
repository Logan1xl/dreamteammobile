/**
 * ============================================================
 * Service Membres - Dream Team Mobile
 * Endpoints : /api/v1/members/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  MemberResponse,
  MemberFinancialStatusResponse,
} from '../types';

// Ajout du type manquant localement
export interface MemberFinancialStatus {
  memberId: string;
  memberName: string;
  matricule: string;
  status: string;
  insurancePaidAmount: number;
  insuranceTotalAmount: number;
  insuranceProgress: number;
  savingsBalance: number;
  unpaidSanctionsCount: number;
  unpaidSanctionsAmount: number;
}

const MEMBERS_BASE = '/members';

/**
 * Récupère le profil membre de l'utilisateur connecté
 */
export const getMyMemberProfile = async (): Promise<ApiResponse<MemberResponse>> => {
  const response = await apiClient.get(`${MEMBERS_BASE}/me`);
  return response.data;
};

/**
 * Récupère un membre par son ID
 */
export const getMemberById = async (id: string): Promise<ApiResponse<MemberResponse>> => {
  const response = await apiClient.get(`${MEMBERS_BASE}/${id}`);
  return response.data;
};

/**
 * Récupère la situation financière d'un membre
 */
export const getMemberFinancialStatus = async (
  id: string
): Promise<ApiResponse<MemberFinancialStatus>> => {
  const response = await apiClient.get(`${MEMBERS_BASE}/${id}/financial-status`);
  return response.data;
};
