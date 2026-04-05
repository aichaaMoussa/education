import toast from 'react-hot-toast';

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

