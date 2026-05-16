'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';
import TurndownService from 'turndown';
import { marked } from 'marked'; 
import { SlashCommandExtension } from '../editor/SlashCommandExtension';
import { slashCommandSuggestion } from '../editor/slashCommandSuggestion';
import { EditorBubbleMenu } from '../editor/EditorBubbleMenu';
import { TableBubbleMenu } from '../editor/TableBubbleMenu';
import { Check } from 'lucide-react';
import { PromptModal } from '../PromptModal';
import { db } from '../../lib/db';
import { useSync } from '../../lib/hooks/useSync';
import { useUIStore } from '../../lib/store/useUIStore';

const lowlight = createLowlight(common);

interface EditorProps {
  nodeId: string;
  initialContent: string;
}

export function HorizonEditor({ nodeId, initialContent }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { syncNodeToFile } = useSync();
  const { autoSaveEnabled } = useUIStore();
  const [highlightColor, setHighlightColor] = useState('#faf594');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [promptConfig, setPromptConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    options?: { label: string; value: string }[];
    onConfirm: (value: string) => void;
  }>({
    show: false,
    title: '',
    message: '',
    defaultValue: '',
    onConfirm: () => { },
  });

  const getMarkdown = useCallback((html: string) => {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    });

    turndownService.addRule('taskList', {
      filter: (node) => node.nodeName === 'UL' && node.getAttribute('data-type') === 'taskList',
      replacement: (content) => '\n' + content + '\n'
    });

    turndownService.addRule('taskItem', {
      filter: (node) => node.nodeName === 'LI' && node.getAttribute('data-type') === 'taskItem',
      replacement: (content, node) => {
        const isChecked = (node as HTMLElement).getAttribute('data-checked') === 'true';
        return `- [${isChecked ? 'x' : ' '}] ${content}\n`;
      }
    });

    return turndownService.turndown(html).replace(/\n{3,}/g, '\n\n');
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      SlashCommandExtension.configure({
        suggestion: slashCommandSuggestion(),
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      CharacterCount,
      Typography,
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: true, allowBase64: true }),
      Youtube.configure({ width: 640, height: 360 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: marked.parse(initialContent),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none p-6 h-full overflow-y-auto min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        const html = editor.getHTML();
        const markdown = getMarkdown(html);
        
        const node = await db.nodes.get(nodeId);
        if (node) {
          await db.nodes.update(nodeId, {
            payload: { ...node.payload, content: markdown },
            lastModified: Date.now()
          });
          // Export to disk if auto-save is enabled
          if (autoSaveEnabled) {
            await syncNodeToFile(nodeId);
          }
        }
        setIsSaving(false);
      }, 1000);
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setPromptConfig({
      show: true,
      title: 'Add Link',
      message: 'Enter the URL:',
      defaultValue: previousUrl || '',
      onConfirm: (url) => {
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
        setPromptConfig(prev => ({ ...prev, show: false }));
      }
    });
  }, [editor]);

  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  const performInstantSave = useCallback(async () => {
    if (!editor) return;
    setIsSaving(true);
    
    // 1. Get current content
    const html = editor.getHTML();
    const markdown = getMarkdown(html);
    
    // 2. Update Database immediately
    const node = await db.nodes.get(nodeId);
    if (node) {
      await db.nodes.update(nodeId, {
        payload: { ...node.payload, content: markdown },
        lastModified: Date.now()
      });
      
      // 3. Force Sync to File (even if auto-save is off)
      await syncNodeToFile(nodeId);
    }
    
    setIsSaving(false);
    setShowSavedIndicator(true);
    setTimeout(() => setShowSavedIndicator(false), 2000);
  }, [editor, nodeId, getMarkdown, syncNodeToFile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        performInstantSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performInstantSave]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="relative h-full flex flex-col bg-background">
      {isSaving && (
        <div className="absolute top-2 right-4 z-10 text-xs text-neutral-500 uppercase tracking-widest animate-pulse">
          Syncing...
        </div>
      )}
      
      <EditorBubbleMenu 
        editor={editor} 
        highlightColor={highlightColor}
        onHighlightColorChange={setHighlightColor}
        onSetLink={setLink}
      />
      
      <TableBubbleMenu editor={editor} />
      
      <EditorContent editor={editor} className="flex-1 overflow-y-auto custom-scrollbar" />

      {showSavedIndicator && (
        <div className="absolute bottom-4 right-4 z-50 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Check size={12} />
          Saved to Disk
        </div>
      )}

      <PromptModal
        show={promptConfig.show}
        title={promptConfig.title}
        message={promptConfig.message}
        defaultValue={promptConfig.defaultValue}
        options={promptConfig.options}
        onConfirm={promptConfig.onConfirm}
        onCancel={() => setPromptConfig(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
