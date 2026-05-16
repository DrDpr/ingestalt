'use client';

import React from 'react';
import { useToastStore } from '@/lib/drdpr-horizon/lib/store/useToastStore';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Toaster() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none items-end">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 40, transition: { duration: 0.2 } }}
                        className={`
                            pointer-events-auto min-w-[320px] max-w-[420px] rounded-xl shadow-2xl border backdrop-blur-3xl
                            ${toast.variant === 'destructive' 
                                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                : toast.variant === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-card/80 border-border/40 text-foreground'
                            }
                        `}
                    >
                        <div className="flex items-start gap-3 p-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                                {toast.variant === 'destructive' ? (
                                    <AlertCircle className="h-5 w-5" />
                                ) : toast.variant === 'success' ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Info className="h-5 w-5 text-blue-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="font-black text-xs uppercase tracking-widest">
                                    {toast.title}
                                </div>
                                {toast.description && (
                                    <div className="mt-1 text-xs opacity-60 font-medium">
                                        {toast.description}
                                    </div>
                                )}
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
