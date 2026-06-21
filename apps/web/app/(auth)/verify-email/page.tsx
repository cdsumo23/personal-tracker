'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyRef = useRef(false);

  useEffect(() => {
    // Avoid double verification in React 18 strict mode
    if (verifyRef.current) return;
    verifyRef.current = true;

    if (!token) {
      setStatus('error');
      setErrorMessage('Missing email verification token.');
      return;
    }

    const verifyEmailToken = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 4000);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Failed to verify email. The token may be invalid or expired.');
      }
    };

    verifyEmailToken();
  }, [token, router]);

  return (
    <div className="space-y-6 text-center">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mb-2">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
      </div>

      {status === 'verifying' && (
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white dark:bg-slate-800 text-primary-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Verifying your email</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Please wait while we verify your email address. This will only take a moment.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500"
          >
            <CheckCircle className="w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verification Successful</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Thank you! Your email address has been verified successfully. You will be redirected to your dashboard in a few seconds.
          </p>
          <div className="pt-2">
            <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-medium text-sm hover:from-primary-600 hover:to-violet-700 transition-all duration-200">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500"
          >
            <XCircle className="w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verification Failed</h1>
          <p className="text-red-400 text-sm max-w-sm mx-auto">
            {errorMessage}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto">
            If the link is expired, please log in to request a new verification email.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-white dark:bg-slate-800 text-primary-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Loading...</h1>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
