'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Columns,
    Rows,
    Trash2,
    Plus,
    MoreHorizontal,
    Table,
    PanelLeft
} from 'lucide-react';

interface TableBubbleMenuProps {
    editor: Editor | null;
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!editor) return;

        const updatePosition = () => {
            if (!editor.isActive('table')) {
                setPosition(null);
                return;
            }

            const { view } = editor;
            const { selection } = editor.state;
            const { from } = selection;

            // Get screen coordinates
            const start = view.coordsAtPos(from);

            // Find offset relative to the scrolling container
            const container = view.dom.offsetParent as HTMLElement;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();

            // Position above the cursor/selection
            setPosition({
                x: start.left - containerRect.left,
                y: (start.top - containerRect.top) + container.scrollTop - 40 // Offset upwards
            });
        };

        editor.on('selectionUpdate', updatePosition);
        editor.on('update', updatePosition);
        editor.on('transaction', updatePosition);

        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('update', updatePosition);
            editor.off('transaction', updatePosition);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <AnimatePresence>
            {position && (
                <motion.div
                    className="absolute z-50 flex items-center gap-1 p-1 bg-card rounded-lg shadow-xl border border-border"
                    style={{
                        left: position.x,
                        top: position.y,
                        transform: 'translateX(-50%)'
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <div className="flex items-center gap-1">
                        <ActionButton
                            onClick={() => editor.chain().focus().addColumnBefore().run()}
                            title="Add Col Before"
                            icon={<div className="flex items-center"><Plus size={10} /><Columns size={14} /></div>}
                        />
                        <ActionButton
                            onClick={() => editor.chain().focus().addColumnAfter().run()}
                            title="Add Col After"
                            icon={<div className="flex items-center"><Columns size={14} /><Plus size={10} /></div>}
                        />
                        <div className="w-px h-4 bg-secondary mx-1" />

                        <ActionButton
                            onClick={() => editor.chain().focus().addRowBefore().run()}
                            title="Add Row Before"
                            icon={<div className="flex items-center flex-col"><Plus size={10} /><Rows size={14} /></div>}
                        />
                        <ActionButton
                            onClick={() => editor.chain().focus().addRowAfter().run()}
                            title="Add Row After"
                            icon={<div className="flex items-center flex-col"><Rows size={14} /><Plus size={10} /></div>}
                        />

                        <div className="w-px h-4 bg-secondary mx-1" />

                        <ActionButton
                            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                            title="Toggle Header Row"
                            className={editor.isActive('tableHeader') ? 'bg-secondary text-neutral-100' : ''}
                            icon={<Table size={14} />}
                        />
                        <ActionButton
                            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
                            title="Toggle Header Column"
                            className={editor.isActive('tableHeader') ? 'bg-secondary text-neutral-100' : ''}
                            icon={<PanelLeft size={14} />}
                        />

                        <div className="w-px h-4 bg-secondary mx-1" />

                        <ActionButton
                            onClick={() => editor.chain().focus().deleteColumn().run()}
                            title="Delete Column"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-500"
                            icon={<div className="relative"><Columns size={14} /><XIcon /></div>}
                        />
                        <ActionButton
                            onClick={() => editor.chain().focus().deleteRow().run()}
                            title="Delete Row"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-500"
                            icon={<div className="relative"><Rows size={14} /><XIcon /></div>}
                        />
                        <ActionButton
                            onClick={() => editor.chain().focus().deleteTable().run()}
                            title="Delete Table"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-500"
                            icon={<Trash2 size={14} />}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ActionButton({ onClick, icon, title, className = '' }: { onClick: () => void, icon: React.ReactNode, title: string, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-md transition-colors text-neutral-400 hover:bg-secondary hover:text-neutral-100 ${className}`}
            title={title}
        >
            {icon}
        </button>
    );
}

function XIcon() {
    return (
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="absolute -bottom-1 -right-1 bg-card rounded-full">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )
}
