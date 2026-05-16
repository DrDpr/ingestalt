'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptModalProps {
    show: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    options?: { label: string; value: string; variant?: 'default' | 'danger' }[];
    onConfirm: (value: string) => void;
    onCancel: () => void;
    icon?: React.ReactNode;
    type?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

/**
 * Modern prompt modal component
 * Replaces primitive window.prompt
 */
export function PromptModal({ 
    show, 
    title, 
    message, 
    defaultValue = '', 
    options, 
    onConfirm, 
    onCancel,
    icon,
    type = 'default'
}: PromptModalProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset input value when modal shows
    useEffect(() => {
        if (show) {
            setInputValue(defaultValue);
            // Focus input after a short delay to ensure modal is rendered
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [show, defaultValue, title, message]);

    // Handle ESC key
    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onCancel) {
                onCancel();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleConfirm();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [show, onCancel, inputValue]);

    const handleConfirm = () => {
        if (inputValue.trim()) {
            onConfirm(inputValue);
        }
    };

    if (!show) return null;

    const typeColors = {
        default: 'text-blue-500/50',
        danger: 'text-red-500/50',
        warning: 'text-amber-500/50',
        success: 'text-emerald-500/50',
        info: 'text-sky-500/50'
    };

    const activeColor = typeColors[type] || typeColors.default;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto"
            onClick={e => e.stopPropagation()}
        >
            <div
                className="w-full max-w-md border-2 border-border bg-card p-6 shadow-2xl rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`${activeColor} shrink-0`}>
                        {icon || <HelpCircle size={32} />}
                    </div>
                    <div className="flex-1">
                        {title && (
                            <h3 className={`${activeColor} font-bold text-lg mb-2`} >{title}</h3>
                        )}
                        {message && (
                            <p className="text-foreground/80 text-sm leading-relaxed mb-4" >{message}</p>
                        )}
                    </div>
                </div>

                {options ? (
                    <div className="flex flex-col gap-2 mb-6">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onConfirm(option.value)}
                                className={`w-full px-4 py-3 text-left border border-border rounded-lg hover:bg-secondary transition-colors flex items-center justify-between group ${option.variant === 'danger' ? 'hover:border-red-500/50' : ''}`}
                            >
                                <span className={`text-sm font-medium ${option.variant === 'danger' ? 'text-red-500' : 'text-foreground/80'}`}>{option.label}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60">→</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Input Field */
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={`w-full px-4 py-3 bg-background border border-border text-foreground/80 text-sm focus:outline-none rounded-lg transition-all mb-6 focus:border-current ${activeColor.replace('text-', 'focus:border-')}`}
                        placeholder="Enter text..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onConfirm(inputValue);
                            }
                        }}
                    />
                )}

                {/* Action Buttons */}
                {!options && (
                    <div className="flex gap-2">
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 border-border bg-card text-foreground/80 hover:bg-secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={`flex-1 text-white ${type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                            Confirm
                        </Button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export default PromptModal;
