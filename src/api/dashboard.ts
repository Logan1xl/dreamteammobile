/**
 * ============================================================
 * Service Dashboard - Dream Team Mobile
 * Endpoints : /api/v1/dashboard/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  MemberDashboardResponse,
  AdminDashboardResponse,
} from '../types';

const DASHBOARD_BASE = '/dashboard';

/**
 * Récupère le dashboard du membre connecté
 */
export const getMemberDashboard = async (): Promise<ApiResponse<MemberDashboardResponse>> => {
  const response = await apiClient.get(`${DASHBOARD_BASE}/member`);
  return response.data;
};

/**
 * Récupère le dashboard administrateur
 */
export const getAdminDashboard = async (): Promise<ApiResponse<AdminDashboardResponse>> => {
  const response = await apiClient.get(`${DASHBOARD_BASE}/admin`);
  return response.data;
};
