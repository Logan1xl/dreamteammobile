/**
 * ============================================================
 * Service d'authentification - Dream Team Mobile
 * Endpoints : /api/v1/auth/*
 * ============================================================
 */
import apiClient from './client';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserResponse,
} from '../types';

const AUTH_BASE = '/auth';

/**
 * Connecte un utilisateur avec email/téléphone + mot de passe
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post(`${AUTH_BASE}/login`, data);
  return response.data;
};

/**
 * Inscrit un nouvel utilisateur
 */
export const register = async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post(`${AUTH_BASE}/register`, data);
  return response.data;
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
export const getCurrentUser = async (): Promise<ApiResponse<UserResponse>> => {
  const response = await apiClient.get(`${AUTH_BASE}/me`);
  return response.data;
};

/**
 * Met à jour le profil de l'utilisateur connecté
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<ApiResponse<UserResponse>> => {
  const response = await apiClient.put(`${AUTH_BASE}/profile`, data);
  return response.data;
};

/**
 * Change le mot de passe de l'utilisateur connecté
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post(`${AUTH_BASE}/change-password`, data);
  return response.data;
};

/**
 * Vérifie la disponibilité d'un email
 */
export const checkEmailAvailability = async (email: string): Promise<ApiResponse<boolean>> => {
  const response = await apiClient.get(`${AUTH_BASE}/check-email`, { params: { email } });
  return response.data;
};

/**
 * Vérifie la disponibilité d'un téléphone
 */
export const checkPhoneAvailability = async (phone: string): Promise<ApiResponse<boolean>> => {
  const response = await apiClient.get(`${AUTH_BASE}/check-phone`, { params: { phone } });
  return response.data;
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post(`${AUTH_BASE}/logout`);
  return response.data;
};
