import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton duration={3000} />
      <RouterProvider router={router} />
    </>
  );
}
