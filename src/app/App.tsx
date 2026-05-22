import { RouterProvider } from 'react-router';
import { router } from './routes';
import { WaitlistPopup } from './components/WaitlistPopup';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <WaitlistPopup />
    </>
  );
}
