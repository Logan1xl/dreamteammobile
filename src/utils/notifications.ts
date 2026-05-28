import type { NotificationResponse } from '../types';

export const getNotificationTarget = (notification: NotificationResponse): string => {
  const type = notification.type?.toUpperCase();

  switch (type) {
    case 'PAYMENT':
      return '/(tabs)/payments';
    case 'REQUEST':
      return '/requests';
    case 'SANCTION':
      return '/sanctions';
    case 'EPARGNE':
    case 'SAVINGS':
      return '/(tabs)/savings';
    case 'TONTINE':
      return '/(tabs)/tontines';
    case 'MEMBER':
      return '/(tabs)/index';
    default:
      return '/(tabs)/index';
  }
};
