'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportPreviewModalProps {
    show: boolean;
    dataUrl: string;
    filename: string;
    format: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Modern modal for previewing canvas exports before saving
 */
export function ExportPreviewModal({ show, dataUrl, filename, format, onConfirm, onCancel }: ExportPreviewModalProps) {
    // Handle ESC key
    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onCancel) {
                onCancel();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onConfirm();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [show, onCancel, onConfirm]);

    if (!show) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto"
            onClick={e => e.stopPropagation()}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-border bg-card p-6 shadow-2xl rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4 shrink-0">
                    <div className="text-blue-500 shrink-0">
                        <Camera size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-blue-500 font-bold text-lg mb-1">EXPORT PREVIEW</h3>
                        <p className="text-foreground/80 text-sm">
                            {filename}.{format}
                        </p>
                    </div>
                </div>

                {/* Image Preview Area */}
                <div className="flex-1 min-h-0 bg-secondary/30 rounded-lg border border-border p-4 mb-6 overflow-hidden flex items-center justify-center relative">
                    {/* Checkered pattern background for transparent PNGs */}
                    <div 
                        className="absolute inset-0 z-0 opacity-20"
                        style={{
                            backgroundImage: 'conic-gradient(#555 90deg, transparent 90deg 180deg, #555 180deg 270deg, transparent 270deg)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 10px 10px'
                        }}
                    />
                    <img 
                        src={dataUrl} 
                        alt="Export Preview" 
                        className="max-w-full max-h-full object-contain relative z-10 shadow-lg border border-border"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 shrink-0">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1 border-border bg-card text-foreground/80 hover:bg-secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-foreground flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download Image
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ExportPreviewModal;
