import type { ReactNode } from 'react';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginProps {
  title?: string;
  description?: string;
  logo?: ReactNode;
  error?: string | null;
  isLoading?: boolean;
  onSubmit?: (data: LoginFormData) => void | Promise<void>;
  onForgotPassword?: () => void;
  showSocialLogins?: boolean;
  onSocialLogin?: (provider: 'github' | 'google' | 'apple') => void;
  className?: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  agreeToTerms: boolean;
}

export interface SignUpProps {
  title?: string;
  description?: string;
  logo?: ReactNode;
  error?: string | null;
  isLoading?: boolean;
  onSubmit?: (data: SignUpFormData) => void | Promise<void>;
  showSocialSignUp?: boolean;
  onSocialSignUp?: (provider: 'github' | 'google') => void;
  requireConfirmPassword?: boolean;
  termsText?: ReactNode;
  className?: string;
}
