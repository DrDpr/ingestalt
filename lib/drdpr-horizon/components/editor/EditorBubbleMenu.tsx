'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Highlighter,
    Code,
    Link as LinkIcon
} from 'lucide-react';

interface EditorBubbleMenuProps {
    editor: Editor | null;
    highlightColor: string;
    onHighlightColorChange: (color: string) => void;
    onSetLink: () => void;
}

export function EditorBubbleMenu({
    editor,
    highlightColor,
    onHighlightColorChange,
    onSetLink
}: EditorBubbleMenuProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!editor) return;

        const updatePosition = () => {
            const { selection } = editor.state;

            // Should show logic: non-empty selection
            if (selection.empty) {
                setPosition(null);
                return;
            }

            // Get the view and positions
            const { view } = editor;
            const { from, to } = selection;

            // Get screen coordinates
            const start = view.coordsAtPos(from);
            const end = view.coordsAtPos(to);

            // Determine center horizontal and top vertical
            const left = Math.min(start.left, end.left);
            const right = Math.max(start.right, end.right);
            const centerX = (left + right) / 2;
            const top = Math.min(start.top, end.top);

            // Find offset relative to the scrolling container
            const container = view.dom.offsetParent as HTMLElement;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();

            // Calculate exact position
            setPosition({
                x: centerX - containerRect.left,
                y: (top - containerRect.top) + container.scrollTop - 10
            });
        };

        // Listen for updates
        editor.on('selectionUpdate', updatePosition);
        editor.on('update', updatePosition);

        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('update', updatePosition);
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
                        transform: 'translate(-50%, -100%)'
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <ButtonStyle
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        label="Bold"
                    >
                        <Bold size={14} />
                    </ButtonStyle>

                    <ButtonStyle
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        label="Italic"
                    >
                        <Italic size={14} />
                    </ButtonStyle>

                    <ButtonStyle
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        label="Underline"
                    >
                        <UnderlineIcon size={14} />
                    </ButtonStyle>

                    <ButtonStyle
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        label="Code"
                    >
                        <Code size={14} />
                    </ButtonStyle>

                    <div className="w-px h-4 bg-secondary mx-1" />

                    <div className="flex items-center gap-0.5">
                        <ButtonStyle
                            onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()}
                            isActive={editor.isActive('highlight', { color: highlightColor })}
                            label="Highlight"
                        >
                            <Highlighter size={14} style={{ color: editor.isActive('highlight') ? 'inherit' : highlightColor }} />
                        </ButtonStyle>
                        <input
                            type="color"
                            value={highlightColor}
                            onChange={(e) => {
                                onHighlightColorChange(e.target.value);
                                if (editor.isActive('highlight')) {
                                    editor.chain().focus().setHighlight({ color: e.target.value }).run();
                                }
                            }}
                            className="w-4 h-4 p-0 border-0 rounded-full overflow-hidden cursor-pointer bg-transparent"
                            title="Highlight Color"
                        />
                    </div>

                    <div className="w-px h-4 bg-secondary mx-1" />

                    <ButtonStyle
                        onClick={onSetLink}
                        isActive={editor.isActive('link')}
                        label="Link"
                    >
                        <LinkIcon size={14} />
                    </ButtonStyle>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ButtonStyle({
    children,
    onClick,
    isActive,
    label
}: {
    children: React.ReactNode,
    onClick: () => void,
    isActive: boolean,
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-blue-500 text-foreground' : 'text-neutral-400 hover:bg-secondary hover:text-neutral-100'}`}
            title={label}
        >
            {children}
        </button>
    );
}
