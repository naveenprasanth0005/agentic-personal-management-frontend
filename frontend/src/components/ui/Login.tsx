import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';
import { Button } from './Button';
import { Form, FormItem, FormLabel, FormControl, FormMessage, Input, Checkbox } from './Form';

import type { LoginProps } from '../authentication/authentication.types';

export function Login({
  title = 'Welcome back',
  description = 'Sign in to access your EasyUI workspace',
  logo = (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-secondary text-foreground shadow-sm">
      <Sparkles className="h-5 w-5" />
    </div>
  ),
  error,
  isLoading = false,
  onSubmit,
  onForgotPassword,
  className,
}: LoginProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function handleSignUpNavigation(): void {
    navigate('/signup');
  }

  function validate(): boolean {
    const errors: {
      email?: string;
      password?: string;
    } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (onSubmit) {
      onSubmit({
        email,
        password,
        rememberMe,
      });
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setEmail(e.target.value);

    if (validationErrors.email) {
      setValidationErrors((previous) => ({
        ...previous,
        email: undefined,
      }));
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setPassword(e.target.value);

    if (validationErrors.password) {
      setValidationErrors((previous) => ({
        ...previous,
        password: undefined,
      }));
    }
  }

  function handleRememberMeChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setRememberMe(e.target.checked);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:py-12">
      <div
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xl transition-all duration-300 sm:p-8',
          className,
        )}
      >
        {/* Header */}
        <div className="relative z-10 mb-6 flex flex-col items-center text-center">
          {logo && <div className="mb-3.5">{logo}</div>}

          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={motionTransitions.springSnappy}
              className="mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <Form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <FormItem>
            <FormLabel required>Email</FormLabel>

            <FormControl>
              <Input
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                leftIcon={<Mail className="h-3.5 w-3.5" />}
                error={!!validationErrors.email}
              />
            </FormControl>

            <FormMessage error={validationErrors.email} />
          </FormItem>

          {/* Password */}
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel required>Password</FormLabel>

              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="focus-ring cursor-pointer rounded text-[11px] text-muted transition-colors hover:text-foreground"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                showPasswordToggle
                value={password}
                onChange={handlePasswordChange}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                error={!!validationErrors.password}
              />
            </FormControl>

            <FormMessage error={validationErrors.password} />
          </FormItem>

          {/* Remember Me */}
          <div className="pt-1">
            <Checkbox
              label="Remember this device"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            loadingText="Authenticating..."
            rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
            className="!mt-2 !w-full !bg-primary !text-primary-foreground hover:!opacity-90"
          >
            Sign In
          </Button>
        </Form>

        {/* Navigate to Sign Up */}
        <div className="mt-6 border-t border-border pt-4 text-center">
          <button
            type="button"
            onClick={handleSignUpNavigation}
            className="focus-ring cursor-pointer rounded text-xs text-muted transition-colors hover:text-foreground"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
