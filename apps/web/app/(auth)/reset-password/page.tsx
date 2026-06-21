'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, TrendingUp, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-2"
        >
          <CheckCircle className="w-10 h-10" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Password Reset Complete</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
          Your password has been changed successfully. You will be redirected to the sign-in page in a few seconds.
        </p>
        <div className="pt-2">
          <Link href="/login" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Invalid Link</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
          This password reset link is invalid or missing a token. Please request a new password reset link.
        </p>
        <div className="pt-2">
          <Link href="/forgot-password" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-medium text-sm hover:from-primary-600 hover:to-violet-700 transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mb-4">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reset Password</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Create a strong new password for your account</p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting password…
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </motion.form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-white dark:bg-slate-800 text-primary-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Loading...</h1>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
