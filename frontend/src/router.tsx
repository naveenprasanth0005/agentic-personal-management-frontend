import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Authentication } from './components/authentication/Authentication';
import { Login } from './components/ui/Login';
import { SignUp } from './components/ui/Signup';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Authentication />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
    ],
  },
]);
