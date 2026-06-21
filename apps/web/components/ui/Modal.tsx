import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title?: string;
 children: React.ReactNode;
 className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
 const [mounted, setMounted] = React.useState(false);

 React.useEffect(() => {
 setMounted(true);
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = '';
 }
 return () => {
 document.body.style.overflow = '';
 };
 }, [isOpen]);

 if (!mounted) return null;

 return createPortal(
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
 />

 {/* Modal Content container */}
 <motion.div
 initial={{ y: '100%', opacity: 0, scale: 1 }}
 animate={{ y: 0, opacity: 1, scale: 1 }}
 exit={{ y: '100%', opacity: 0, scale: 0.95 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className={cn(
 'relative w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col',
 className
 )}
 >
 {/* Grab handle for mobile bottom sheets */}
 <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4 block sm:hidden" />

 {/* Header */}
 <div className="flex items-center justify-between mb-4">
 {title && (
 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
 )}
 <button
 onClick={onClose}
 className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Body */}
 <div className="overflow-y-auto pr-1 flex-1 py-1">
 {children}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>,
 document.body
 );
}
