'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Editor, Range } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
    Code, Quote, Minus, Image as ImageIcon, Video, Table as TableIcon,
    FileText, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

export interface SlashCommand {
    title: string;
    description: string;
    icon: React.ReactNode;
    command: (props: { editor: Editor; range: Range }) => void;
    searchTerms?: string[];
}

interface SlashCommandsProps {
    editor: Editor;
    range: Range;
    onClose: () => void;
    onImageInsert?: () => void;
    onYouTubeInsert?: () => void;
}

export interface SlashCommandsHandle {
    onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommands = forwardRef<SlashCommandsHandle, SlashCommandsProps>(
    ({ editor, range, onClose, onImageInsert, onYouTubeInsert }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);
        const [search, setSearch] = useState('');

        const commands: SlashCommand[] = [
            {
                title: 'Heading 1',
                description: 'Large section heading',
                icon: <Heading1 size={18} />,
                searchTerms: ['h1', 'heading', 'title'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                },
            },
            {
                title: 'Heading 2',
                description: 'Medium section heading',
                icon: <Heading2 size={18} />,
                searchTerms: ['h2', 'heading', 'subtitle'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                },
            },
            {
                title: 'Heading 3',
                description: 'Small section heading',
                icon: <Heading3 size={18} />,
                searchTerms: ['h3', 'heading', 'subheading'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
                },
            },
            {
                title: 'Bullet List',
                description: 'Create a simple bullet list',
                icon: <List size={18} />,
                searchTerms: ['ul', 'list', 'bullet'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                },
            },
            {
                title: 'Numbered List',
                description: 'Create a numbered list',
                icon: <ListOrdered size={18} />,
                searchTerms: ['ol', 'list', 'number', 'ordered'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                },
            },
            {
                title: 'Task List',
                description: 'Track tasks with checkboxes',
                icon: <CheckSquare size={18} />,
                searchTerms: ['todo', 'task', 'checkbox', 'check'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleTaskList().run();
                },
            },
            {
                title: 'Code Block',
                description: 'Insert a code snippet',
                icon: <Code size={18} />,
                searchTerms: ['code', 'snippet', 'programming'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                },
            },
            {
                title: 'Quote',
                description: 'Insert a blockquote',
                icon: <Quote size={18} />,
                searchTerms: ['quote', 'blockquote', 'citation'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
                },
            },
            {
                title: 'Divider',
                description: 'Insert a horizontal line',
                icon: <Minus size={18} />,
                searchTerms: ['hr', 'divider', 'line', 'separator'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).setHorizontalRule().run();
                },
            },
            {
                title: 'Table',
                description: 'Insert a table',
                icon: <TableIcon size={18} />,
                searchTerms: ['table', 'grid'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                },
            },
            {
                title: 'Image',
                description: 'Upload or embed an image',
                icon: <ImageIcon size={18} />,
                searchTerms: ['image', 'picture', 'photo', 'img'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    onImageInsert?.();
                },
            },
            {
                title: 'YouTube',
                description: 'Embed a YouTube video',
                icon: <Video size={18} />,
                searchTerms: ['youtube', 'video', 'embed'],
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    onYouTubeInsert?.();
                },
            },
        ];

        // Filter commands based on search
        const filteredCommands = search
            ? commands.filter(cmd => {
                const searchLower = search.toLowerCase();
                return (
                    cmd.title.toLowerCase().includes(searchLower) ||
                    cmd.description.toLowerCase().includes(searchLower) ||
                    cmd.searchTerms?.some(term => term.includes(searchLower))
                );
            })
            : commands;

        // Update search from editor content
        useEffect(() => {
            const text = editor.state.doc.textBetween(range.from, range.to, '');
            setSearch(text.slice(1)); // Remove the '/' character
        }, [editor, range]);

        // Reset selected index when filtered commands change
        useEffect(() => {
            setSelectedIndex(0);
        }, [search]);

        const selectItem = (index: number) => {
            const command = filteredCommands[index];
            if (command) {
                command.command({ editor, range });
                onClose();
            }
        };

        useImperativeHandle(ref, () => ({
            onKeyDown: (event: KeyboardEvent) => {
                if (event.key === 'ArrowUp') {
                    setSelectedIndex((selectedIndex + filteredCommands.length - 1) % filteredCommands.length);
                    return true;
                }

                if (event.key === 'ArrowDown') {
                    setSelectedIndex((selectedIndex + 1) % filteredCommands.length);
                    return true;
                }

                if (event.key === 'Enter') {
                    selectItem(selectedIndex);
                    return true;
                }

                if (event.key === 'Escape') {
                    onClose();
                    return true;
                }

                return false;
            },
        }));

        if (filteredCommands.length === 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border border-border bg-card shadow-lg p-4 text-center text-neutral-400"
                >
                    <p className="text-sm">No commands found</p>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border border-border bg-card shadow-2xl overflow-hidden max-h-[400px] w-[320px]"
            >
                <div className="overflow-y-auto max-h-[400px]">
                    {filteredCommands.map((command, index) => (
                        <button
                            key={command.title}
                            onClick={() => selectItem(index)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0 ${index === selectedIndex
                                    ? 'bg-blue-500/10'
                                    : 'hover:bg-secondary/50'
                                }`}
                        >
                            <div
                                className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${index === selectedIndex ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary text-neutral-400'}`}
                            >
                                {command.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-neutral-100">
                                    {command.title}
                                </div>
                                <div className="text-xs truncate text-neutral-400">
                                    {command.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>
        );
    }
);

SlashCommands.displayName = 'SlashCommands';
