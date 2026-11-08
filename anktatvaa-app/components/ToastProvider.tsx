'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3400);
  };

  useEffect(() => {
    // Expose globally to window for any inline handlers
    (window as any).showToast = showToast;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-5 py-3.5 bg-[#1B1915]/95 border border-[#B08A57]/40 rounded-sm shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-[fadeIn_0.3s_cubic-bezier(0.16,1,0.3,1)] text-[#E8E0D2] font-mono text-xs tracking-wider uppercase"
        >
          <span className="text-[#B08A57] text-sm font-bold">॥</span>
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
