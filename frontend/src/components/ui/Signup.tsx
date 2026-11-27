import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';
import { Button } from './Button';
import { Form, FormItem, FormLabel, FormControl, FormMessage, Input, Checkbox } from './Form';

import type { SignUpProps } from '../authentication/authentication.types';

export function SignUp({
  title = 'Create an account',
  description = 'Join EasyUI to access components and templates',
  logo = (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-secondary text-foreground shadow-sm">
      <Sparkles className="h-5 w-5" />
    </div>
  ),
  error,
  isLoading = false,
  onSubmit,
  requireConfirmPassword = true,
  termsText = (
    <span>
      I agree to the{' '}
      <a href="#terms" className="text-foreground underline underline-offset-2 hover:opacity-80">
        Terms of Service
      </a>{' '}
      and{' '}
      <a href="#privacy" className="text-foreground underline underline-offset-2 hover:opacity-80">
        Privacy Policy
      </a>
    </span>
  ),
  className,
}: SignUpProps) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  function handleSignInNavigation(): void {
    navigate('/login');
  }

  function getPasswordStrength(pass: string): number {
    if (!pass) {
      return 0;
    }

    let score = 0;

    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    return score;
  }

  const strength = getPasswordStrength(password);

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (requireConfirmPassword) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!agreeToTerms) {
      errors.terms = 'You must accept the terms and conditions';
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
        name,
        email,
        password,
        confirmPassword,
        agreeToTerms,
      });
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setName(e.target.value);

    if (validationErrors.name) {
      setValidationErrors((previous) => ({
        ...previous,
        name: undefined,
      }));
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

  function handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setConfirmPassword(e.target.value);

    if (validationErrors.confirmPassword) {
      setValidationErrors((previous) => ({
        ...previous,
        confirmPassword: undefined,
      }));
    }
  }

  function handleTermsChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setAgreeToTerms(e.target.checked);

    if (validationErrors.terms) {
      setValidationErrors((previous) => ({
        ...previous,
        terms: undefined,
      }));
    }
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div
        className={cn(
          'relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xl transition-all duration-300 sm:p-8',
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

        {/* Sign Up Form */}
        <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
          {/* Full Name */}
          <FormItem>
            <FormLabel required>Full Name</FormLabel>

            <FormControl>
              <Input
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                value={name}
                onChange={handleNameChange}
                leftIcon={<User className="h-3.5 w-3.5" />}
                error={!!validationErrors.name}
              />
            </FormControl>

            <FormMessage error={validationErrors.name} />
          </FormItem>

          {/* Email */}
          <FormItem>
            <FormLabel required>Email Address</FormLabel>

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
            <FormLabel required>Password</FormLabel>

            <FormControl>
              <Input
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                showPasswordToggle
                value={password}
                onChange={handlePasswordChange}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                error={!!validationErrors.password}
              />
            </FormControl>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-1 pt-1.5">
                <div className="flex h-1 gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        'flex-1 rounded-full transition-colors duration-200',
                        strength >= step
                          ? step === 1
                            ? 'bg-rose-400'
                            : step === 2
                              ? 'bg-amber-500'
                              : step === 3
                                ? 'bg-sky-400'
                                : 'bg-emerald-300'
                          : 'bg-border',
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Strength</span>

                  <span className="text-muted">{strengthLabels[strength - 1] || 'Weak'}</span>
                </div>
              </div>
            )}

            <FormMessage error={validationErrors.password} />
          </FormItem>

          {/* Confirm Password */}
          {requireConfirmPassword && (
            <FormItem>
              <FormLabel required>Confirm Password</FormLabel>

              <FormControl>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  showPasswordToggle
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  leftIcon={<Lock className="h-3.5 w-3.5" />}
                  error={!!validationErrors.confirmPassword}
                />
              </FormControl>

              <FormMessage error={validationErrors.confirmPassword} />
            </FormItem>
          )}

          {/* Terms Agreement */}
          <div className="pt-1 sm:col-span-2">
            <Checkbox label={termsText} checked={agreeToTerms} onChange={handleTermsChange} />

            <FormMessage error={validationErrors.terms} />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              loadingText="Creating account..."
              rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" /> : undefined}
              className="!mt-1 !w-full !bg-primary !text-primary-foreground hover:!opacity-90"
            >
              Create Account
            </Button>
          </div>
        </Form>

        {/* Navigate to Login */}
        <div className="mt-6 border-t border-border pt-4 text-center">
          <button
            type="button"
            onClick={handleSignInNavigation}
            className="focus-ring cursor-pointer rounded text-xs text-muted transition-colors hover:text-foreground"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
