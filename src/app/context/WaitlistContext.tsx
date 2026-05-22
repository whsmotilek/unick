import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

interface WaitlistContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const WaitlistContext = createContext<WaitlistContextValue | undefined>(undefined);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <WaitlistContext.Provider value={{ isOpen, open, close }}>
      {children}
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error('useWaitlist must be used within WaitlistProvider');
  return ctx;
}
