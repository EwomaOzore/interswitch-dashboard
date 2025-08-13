import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { SessionTimeoutModal } from '../components/SessionTimeoutModal';
import '../styles/globals.css';
import '../styles/design-tokens.css';

function SessionManager({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, logout } = useAuth();
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const sessionTimeout = useSessionTimeout({
    timeoutMinutes: 5,
    warningMinutes: 1,
    onTimeout: () => {
      setShowTimeoutModal(false);
      logout();
    },
    onWarning: () => {
      setShowTimeoutModal(true);
    },
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      sessionTimeout.startTimer();
      setShowTimeoutModal(false);
    } else {
      sessionTimeout.stopTimer();
      setShowTimeoutModal(false);
    }
  }, [isAuthenticated, sessionTimeout]);

  const handleExtendSession = () => {
    setShowTimeoutModal(false);
    sessionTimeout.resetTimer();
  };

  const handleLogout = () => {
    setShowTimeoutModal(false);
    logout();
  };

  return (
    <>
      {children}
      <SessionTimeoutModal
        isOpen={showTimeoutModal && isAuthenticated}
        timeLeft={sessionTimeout.timeLeft}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
      />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionManager>
          <div className="interswitch-theme">
            <Component {...pageProps} />
          </div>
        </SessionManager>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
