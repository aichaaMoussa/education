import toast from 'react-hot-toast';

type PromiseMessages<T> = {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
};

/** Notifications basées sur react-hot-toast — point d’entrée unique pour l’app. */
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: '✅',
    });
  },

  error: (message: string) => {
    toast.error(message, {
      icon: '❌',
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  /** Ferme un toast (ex. loading) par id, ou tous les toasts si aucun id. */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Enchaîne automatiquement : loading → succès ou erreur (un seul toast visible à la fois).
   * Utiliser de préférence aux combos loading + success/error manuels.
   */
  promise: <T,>(promise: Promise<T>, messages: PromiseMessages<T>) => {
    return toast.promise(promise, messages);
  },

  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  },

  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },
};

