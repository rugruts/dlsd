/**
 * i18n Configuration
 * Internationalization setup for DumpSack Wallet
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    common: {
      // App
      appName: 'DumpSack',
      
      // Actions
      send: 'Send',
      receive: 'Receive',
      buy: 'Buy',
      swap: 'Swap',
      copy: 'Copy',
      share: 'Share',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      close: 'Close',
      
      // Wallet
      wallet: 'Wallet',
      wallets: 'Wallets',
      balance: 'Balance',
      tokens: 'Tokens',
      nfts: 'NFTs',
      activity: 'Activity',
      
      // Settings
      settings: 'Settings',
      general: 'General',
      networks: 'Networks',
      security: 'Security',
      about: 'About',
      currency: 'Currency',
      language: 'Language',
      theme: 'Theme',
      
      // Theme options
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      
      // Messages
      copied: 'Copied to clipboard',
      error: 'Error',
      success: 'Success',
      loading: 'Loading...',
      
      // Errors
      errorGeneric: 'Something went wrong',
      errorNetwork: 'Network error',
      errorInvalidAddress: 'Invalid address',
    },
  },
  es: {
    common: {
      // App
      appName: 'DumpSack',
      
      // Actions
      send: 'Enviar',
      receive: 'Recibir',
      buy: 'Comprar',
      swap: 'Intercambiar',
      copy: 'Copiar',
      share: 'Compartir',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      remove: 'Quitar',
      back: 'Atrás',
      next: 'Siguiente',
      done: 'Hecho',
      close: 'Cerrar',
      
      // Wallet
      wallet: 'Billetera',
      wallets: 'Billeteras',
      balance: 'Saldo',
      tokens: 'Tokens',
      nfts: 'NFTs',
      activity: 'Actividad',
      
      // Settings
      settings: 'Configuración',
      general: 'General',
      networks: 'Redes',
      security: 'Seguridad',
      about: 'Acerca de',
      currency: 'Moneda',
      language: 'Idioma',
      theme: 'Tema',
      
      // Theme options
      themeSystem: 'Sistema',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      
      // Messages
      copied: 'Copiado al portapapeles',
      error: 'Error',
      success: 'Éxito',
      loading: 'Cargando...',
      
      // Errors
      errorGeneric: 'Algo salió mal',
      errorNetwork: 'Error de red',
      errorInvalidAddress: 'Dirección inválida',
    },
  },
};

// Initialize i18next
export function initI18n(language: string = 'en') {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      defaultNS: 'common',
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
}

export default i18n;

