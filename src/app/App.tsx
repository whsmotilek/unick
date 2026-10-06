import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { WaitlistPopup } from './components/WaitlistPopup';
import { useAuth } from './context/AuthContext';
import { useDataStore } from './store/DataStore';
import { hideBootLoader } from './lib/bootLoader';

/** Убирает стартовый экран, когда известна сессия и (для вошедших) загружены данные — без мигания заглушек. */
function BootGate() {
  const { loading: authLoading, user } = useAuth();
  const { loading: dataLoading } = useDataStore();
  useEffect(() => {
    if (!authLoading && (!user || !dataLoading)) hideBootLoader();
  }, [authLoading, user, dataLoading]);
  useEffect(() => {
    const t = window.setTimeout(hideBootLoader, 10_000); // страховка, если что-то зависло
    return () => window.clearTimeout(t);
  }, []);
  return null;
}

export default function App() {
  return (
    <>
      <BootGate />
      <RouterProvider router={router} />
      <WaitlistPopup />
    </>
  );
}
