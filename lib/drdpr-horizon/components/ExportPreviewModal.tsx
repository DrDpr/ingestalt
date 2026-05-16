'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportPreviewModalProps {
    show: boolean;
    generateImage: (transparent: boolean) => Promise<{ dataUrl: string, filename: string, format: string }>;
    onCancel: () => void;
}

/**
 * Modern modal for previewing canvas exports before saving
 */
export function ExportPreviewModal({ show, generateImage, onCancel }: ExportPreviewModalProps) {
    const [isTransparent, setIsTransparent] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [preview, setPreview] = useState<{ url: string; filename: string; format: string } | null>(null);

    // Generate image whenever `show` or `isTransparent` changes
    useEffect(() => {
        if (!show) {
            setPreview(null);
            return;
        }

        let isMounted = true;
        
        const generate = async () => {
            setIsGenerating(true);
            try {
                const result = await generateImage(isTransparent);
                if (isMounted) {
                    setPreview({
                        url: result.dataUrl,
                        filename: result.filename,
                        format: result.format
                    });
                }
            } catch (error) {
                console.error("Failed to generate image preview:", error);
            } finally {
                if (isMounted) setIsGenerating(false);
            }
        };

        generate();

        return () => {
            isMounted = false;
        };
    }, [show, isTransparent, generateImage]);

    // Handle ESC key
    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onCancel) {
                onCancel();
            } else if (e.key === 'Enter' && !e.shiftKey && preview && !isGenerating) {
                e.preventDefault();
                handleDownload();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [show, onCancel, preview, isGenerating]);

    const handleDownload = () => {
        if (preview) {
            const link = document.createElement('a');
            link.download = `${preview.filename}.${preview.format}`;
            link.href = preview.url;
            link.click();
            onCancel();
        }
    };

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
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <h3 className="text-blue-500 font-bold text-lg mb-1">EXPORT PREVIEW</h3>
                            <p className="text-foreground/80 text-sm">
                                {preview ? `${preview.filename}.${preview.format}` : 'Generating...'}
                            </p>
                        </div>
                        
                        {/* Transparent Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer bg-secondary/50 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                            <input 
                                type="checkbox" 
                                checked={isTransparent}
                                onChange={(e) => setIsTransparent(e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-background border-border"
                            />
                            <span className="text-sm font-medium">Transparent Background</span>
                        </label>
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
                    
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-3 relative z-10 text-foreground/60">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-medium">Rendering high-resolution image...</p>
                        </div>
                    ) : preview ? (
                        <img 
                            src={preview.url} 
                            alt="Export Preview" 
                            className="max-w-full max-h-full object-contain relative z-10 shadow-lg border border-border transition-opacity duration-300"
                        />
                    ) : null}
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
                        onClick={handleDownload}
                        disabled={isGenerating || !preview}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-foreground flex items-center gap-2 disabled:opacity-50"
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
