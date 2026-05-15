'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptModalProps {
    show: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    options?: { label: string; value: string }[];
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

/**
 * Modern prompt modal component
 * Replaces primitive window.prompt
 */
export function PromptModal({ show, title, message, defaultValue = '', options, onConfirm, onCancel }: PromptModalProps) {
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
    }, [show, defaultValue]);

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

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto"
            onClick={e => e.stopPropagation()}
        >
            <div
                className="w-full max-w-md border-2 border-neutral-800 bg-neutral-900 p-6 shadow-2xl rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="text-blue-500 shrink-0">
                        <Type size={32} />
                    </div>
                    <div className="flex-1">
                        {title && (
                            <h3 className="text-blue-500 font-bold text-lg mb-2" >{title}</h3>
                        )}
                        {message && (
                            <p className="text-neutral-100 text-sm leading-relaxed mb-4" >{message}</p>
                        )}
                    </div>
                </div>

                {options ? (
                    <div className="flex flex-col gap-2 mb-6">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onConfirm(option.value)}
                                className="w-full px-4 py-3 text-left border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-between group"
                            >
                                <span className="text-sm font-medium text-neutral-100">{option.label}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400">→</span>
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
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-blue-500 rounded-lg transition-all mb-6"
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
                            className="flex-1 border-neutral-800 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
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
