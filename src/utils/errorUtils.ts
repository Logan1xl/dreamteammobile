/**
 * ============================================================
 * Error Utils - Dream Team Mobile
 * Gestion centralisée et formatage des erreurs API
 * ============================================================
 */

import { AxiosError } from 'axios';
import { Alert } from 'react-native';

export interface FormattedError {
  message: string;
  type: 'NETWORK' | 'SERVER' | 'CLIENT' | 'AUTH' | 'VALIDATION' | 'UNKNOWN';
  technicalDetails?: any;
}

/**
 * Formate une erreur Axios ou générique en un objet compréhensible par l'UI
 */
export const formatError = (error: any): FormattedError => {
  if (error?.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    // Erreur d'authentification (401, 403)
    if (status === 401 || status === 403) {
      return {
        message: "Session expirée ou accès refusé. Veuillez vous reconnecter.",
        type: 'AUTH',
        technicalDetails: data,
      };
    }

    // Erreur de validation ou règle métier (400, 409, 422)
    if (status === 400 || status === 409 || status === 422) {
      // Tenter d'extraire le message du backend s'il existe
      const backendMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        (Array.isArray(data?.errors) ? data.errors.join('\n') : undefined);

      return {
        message: backendMessage || "Cette opération n'est pas possible pour le moment.",
        type: 'VALIDATION',
        technicalDetails: data,
      };
    }

    // Erreur non trouvée (404)
    if (status === 404) {
      return {
        message: "La ressource demandée est introuvable.",
        type: 'CLIENT',
        technicalDetails: data,
      };
    }

    // Erreur serveur (500+)
    if (status && status >= 500) {
      return {
        message: "Une erreur technique est survenue sur nos serveurs. Nos équipes sont informées.",
        type: 'SERVER',
        technicalDetails: data,
      };
    }

    // Erreur réseau (pas de réponse)
    if (!status) {
      return {
        message: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
        type: 'NETWORK',
        technicalDetails: axiosError.message,
      };
    }
  }

  // Erreur générique
  return {
    message: error?.message || "Une erreur inattendue est survenue.",
    type: 'UNKNOWN',
    technicalDetails: error,
  };
};

/**
 * Affiche une alerte d'erreur stylisée et uniforme
 */
export const showErrorAlert = (error: any, title: string = "Oups !") => {
  const formatted = formatError(error);
  
  // En production, on ne logge pas les technicalDetails en clair à l'utilisateur
  // On affiche uniquement le message formaté
  Alert.alert(
    title,
    formatted.message,
    [{ text: "OK", style: "default" }]
  );

  // Log contrôlé pour le développeur: les erreurs API attendues ne doivent pas
  // déclencher LogBox pendant les tests utilisateur.
  if (__DEV__) {
    console.log(`[API Handled] Type: ${formatted.type} | Message: ${formatted.message}`, formatted.technicalDetails);
  }
};
