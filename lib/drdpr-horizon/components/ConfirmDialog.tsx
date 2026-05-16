'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modern confirm dialog component
 * Replaces primitive window.confirm
 */
export function ConfirmDialog({
  show,
  title,
  message,
  variant = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!show) return null;

  const variantConfig = {
    danger: {
      icon: XCircle,
      iconColor: 'text-red-500',
      titleColor: 'text-red-500',
      buttonClass: 'bg-red-600 hover:bg-red-500'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-500',
      buttonClass: 'bg-amber-600 hover:bg-amber-500'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-500',
      buttonClass: 'bg-blue-600 hover:bg-blue-500'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      titleColor: 'text-green-500',
      buttonClass: 'bg-green-600 hover:bg-green-500'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md border-2 border-border bg-card p-6 shadow-2xl rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`${config.iconColor} shrink-0`}>
            <Icon size={32} />
          </div>
          <div className="flex-1">
            <h3 className={`${config.titleColor} font-bold text-lg mb-2`}>{title}</h3>
            <p className="text-foreground/80 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-border bg-card text-foreground/80 hover:bg-secondary"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${config.buttonClass} text-foreground`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Made with Bob
