/**
 * ============================================================
 * Service Notifications - Dream Team Mobile
 * Endpoints : /api/v1/notifications/*
 * ============================================================
 */
import apiClient from './client';
import { ApiResponse, NotificationResponse, PageResponse } from '../types';

const NOTIFICATIONS_BASE = '/notifications';

export const getMyNotifications = async (
  page = 0,
  size = 5
): Promise<ApiResponse<PageResponse<NotificationResponse>>> => {
  const response = await apiClient.get(NOTIFICATIONS_BASE, {
    params: { page, size },
  });
  return response.data;
};

export const markNotificationAsRead = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post(`${NOTIFICATIONS_BASE}/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post(`${NOTIFICATIONS_BASE}/read-all`);
  return response.data;
};

export const deleteNotification = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete(`${NOTIFICATIONS_BASE}/${id}`);
  return response.data;
};
