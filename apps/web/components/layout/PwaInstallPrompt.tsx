'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
 readonly platforms: Array<string>;
 readonly userChoice: Promise<{
 outcome: 'accepted' | 'dismissed';
 platform: string;
 }>;
 prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
 const [isVisible, setIsVisible] = React.useState(false);
 const [isIos, setIsIos] = React.useState(false);
 const [isAndroid, setIsAndroid] = React.useState(false);
 const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);

 React.useEffect(() => {
 // Only run on client-side
 if (typeof window === 'undefined') return;

 // Check if user is already in standalone/installed mode
 const isStandalone = 
 window.matchMedia('(display-mode: standalone)').matches || 
 (window.navigator as any).standalone === true;

 if (isStandalone) return;

 // Check if dismissed previously
 const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
 if (isDismissed) return;

 // Detect OS
 const ua = window.navigator.userAgent;
 const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
 const android = /Android/.test(ua);

 setIsIos(ios);
 setIsAndroid(android);

 // If it's iOS Safari, we show the prompt after a small delay
 if (ios) {
 const timer = setTimeout(() => {
 setIsVisible(true);
 }, 3000);
 return () => clearTimeout(timer);
 }

 // Listener for Android/Chrome direct prompt
 const handleBeforeInstallPrompt = (e: Event) => {
 e.preventDefault();
 setDeferredPrompt(e as BeforeInstallPromptEvent);
 setIsVisible(true);
 };

 window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

 return () => {
 window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
 };
 }, []);

 const handleInstallClick = async () => {
 if (!deferredPrompt) return;

 // Show native prompt
 await deferredPrompt.prompt();

 // Wait for the user's choice
 const choiceResult = await deferredPrompt.userChoice;
 
 if (choiceResult.outcome === 'accepted') {
 console.log('User accepted the PWA install prompt');
 setIsVisible(false);
 }
 
 setDeferredPrompt(null);
 };

 const handleDismiss = () => {
 setIsVisible(false);
 localStorage.setItem('pwa-prompt-dismissed', 'true');
 };

 if (!isVisible) return null;

 return (
 <AnimatePresence>
 <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
 <motion.div
 initial={{ y: 100, opacity: 0, scale: 0.95 }}
 animate={{ y: 0, opacity: 1, scale: 1 }}
 exit={{ y: 100, opacity: 0, scale: 0.95 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-lg flex flex-col gap-4"
 >
 {/* Subtle top decoration gradient */}
 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-violet-500" />

 {/* Close button */}
 <button
 onClick={handleDismiss}
 className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800/60 transition-colors"
 >
 <X className="w-4 h-4" />
 </button>

 {/* Main Info */}
 <div className="flex items-start gap-3.5">
 <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 border border-primary-500/30 text-primary-400">
 <Smartphone className="w-6 h-6" />
 </div>
 <div className="space-y-1 pr-6">
 <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Install Smart Planner Shortcut</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
 Access your budgets, ledger entries, and goals instantly from your home screen just like a native app.
 </p>
 </div>
 </div>

 {/* Action Area */}
 <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
 {isIos ? (
 // iOS Instructions
 <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300">
 <div className="flex items-center gap-2">
 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-800 dark:text-slate-200">1</span>
 <span>Tap the **Share** button <Share className="w-3.5 h-3.5 inline text-primary-400 mx-0.5" /> in Safari.</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-800 dark:text-slate-200">2</span>
 <span>Select **Add to Home Screen** <PlusSquare className="w-3.5 h-3.5 inline text-primary-400 mx-0.5" />.</span>
 </div>
 </div>
 ) : deferredPrompt ? (
 // Android Native Button
 <div className="flex items-center gap-3">
 <button
 onClick={handleInstallClick}
 className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 text-xs font-bold text-white shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all duration-200"
 >
 <Download className="w-4 h-4" />
 Install Shortcut
 </button>
 <button
 onClick={handleDismiss}
 className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors"
 >
 Not Now
 </button>
 </div>
 ) : (
 // Generic Mobile Fallback Instruction
 <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
 To install, open your browser options menu and tap **Add to Home Screen**.
 </p>
 )}
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
