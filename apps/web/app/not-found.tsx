'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, FileQuestion, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mb-2 shadow-glow">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* 404 Visual Indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative inline-flex items-center justify-center p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400"
        >
          <FileQuestion className="w-16 h-16 text-primary-400" />
          <span className="absolute -top-2 -right-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-md">
            404
          </span>
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Sorry, we couldn&apos;t find the page you are looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold text-sm hover:from-primary-600 hover:to-violet-700 transition-all duration-200 shadow-glow transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
