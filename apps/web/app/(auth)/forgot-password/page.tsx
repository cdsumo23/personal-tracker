'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div className="text-center space-y-6 py-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Check your email</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We&apos;ve sent a password reset link to<br />
            <span className="text-slate-200 font-medium">{sentEmail}</span>
          </p>
          <p className="text-slate-500 text-xs mt-3">Didn&apos;t receive it? Check your spam folder or try again.</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => setSent(false)} className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
            Try a different email
          </button>
          <Link href="/login" className="block text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
            ← Back to login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div className="text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600/20 border border-primary-500/30 mb-4">
          <Mail className="w-6 h-6 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Reset your password</h1>
        <p className="text-slate-400 mt-2 text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
      </motion.div>

      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow min-h-[48px]"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : 'Send reset link'}
        </button>
      </motion.form>

      <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
}
