import * as React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void | Promise<void>;
 title: string;
 message: string;
 confirmLabel?: string;
 cancelLabel?: string;
 isDestructive?: boolean;
}

export function ConfirmDialog({
 isOpen,
 onClose,
 onConfirm,
 title,
 message,
 confirmLabel = 'Confirm',
 cancelLabel = 'Cancel',
 isDestructive = true,
}: ConfirmDialogProps) {
 const [isSubmitting, setIsSubmitting] = React.useState(false);

 const handleConfirm = async () => {
 setIsSubmitting(true);
 try {
 await onConfirm();
 onClose();
 } catch {
 // Keep open if error
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
 <div className="space-y-6 pt-2">
 <div className="flex items-start gap-4">
 <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
 <AlertTriangle className="w-6 h-6" />
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
 </div>

 <div className="flex items-center justify-end gap-3 pt-2">
 <Button onClick={onClose} variant="outline" size="sm">
 {cancelLabel}
 </Button>
 <Button
 onClick={handleConfirm}
 isLoading={isSubmitting}
 variant={isDestructive ? 'destructive' : 'default'}
 size="sm"
 >
 {confirmLabel}
 </Button>
 </div>
 </div>
 </Modal>
 );
}
