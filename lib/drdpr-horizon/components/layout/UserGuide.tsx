'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, BookOpen, Sparkles, Layers, Zap, Bot, FolderOpen,
  ShieldCheck, Component, Network, FileText, Camera, Keyboard,
  RefreshCw, Copy, Check, Compass, Cpu, Share2, Info,
  ZapOff, Moon, Files, Upload, Plus, Save, RotateCcw, Trash2, Search, Download,
  HardDrive, Settings2, Database, Wifi
} from 'lucide-react';
import { useUIStore } from '@/lib/drdpr-horizon/lib/store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';

export function UserGuide() {
  const isGuideOpen = useUIStore((state) => state.isGuideOpen);
  const setGuideOpen = useUIStore((state) => state.setGuideOpen);
  const [activeTab, setActiveTab] = useState<'getting-started' | 'canvas' | 'inspector' | 'interface' | 'standards' | 'ai'>('getting-started');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [workflowPath, setWorkflowPath] = useState<'scratch' | 'wiki' | 'atlas' | 'schema' | 'ai' | 'publish'>('scratch');
  const [mounted, setMounted] = useState(false);

  const copyColorToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC to close
  useEffect(() => {
    if (!isGuideOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGuideOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGuideOpen, setGuideOpen]);

  if (!mounted || !isGuideOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const downloadReferenceGuide = () => {
    const content = `# Ingestalt Dynamic Schema & YAML Frontmatter Reference Guide

This document serves as the official dynamic schema reference for the Ingestalt spatial mapping engine. Configure these fields in your note's frontmatter to unlock custom, interactive parameter panels in the Properties Workspace.

---

## 1. Core Header & Identity Attributes
Every physical note inside your workspace supports these identity, spatial, and visual layout variables:

\`\`\`yaml
title: "User Profile Controller"
type: "api"
icon: "Cpu"
color: "#3b82f6"
tags:
  - "auth"
  - "controller"
filepath: "src/controllers/UserController.ts"
filename: "UserController.ts"
configId: "microservice"
position:
  x: 250
  y: 420
\`\`\`

### Attributes Breakdown:
- \`title\`: (String) The visual card name on the spatial flow canvas. If omitted, falls back to the first H1 heading (\`# Title\`) parsed from the Markdown content.
- \`type\`: (String) Core base classification (e.g. \`api\`, \`database\`, \`frontend\`, \`hook\`, \`note\`, \`ai-task\`).
- \`configId\` (or \`config_id\`): (String) Binds the node card to a specific custom Standards Blueprint configuration definitions schema.
- \`position\`: (Object) Holds absolute canvas \`x\` and \`y\` grid offsets to persist note card positions on the spatial board.

---

## 2. Dynamic Field Types Reference
Ingestalt's Node Types Editor supports 7 distinct data types, mapping frontmatter parameters to structured visual interfaces.

### A. Plain Text (\`type: text\`)
Standard single-line text input fields or custom parameters.
\`\`\`yaml
description: "Standard string representation or custom configuration payload."
\`\`\`

### B. File Path (\`type: file_path\`)
Deep-linked local file paths. Renders with an active lightning bolt (\`⚡\`) launch trigger to open the code directly inside your IDE.
\`\`\`yaml
filepath: "src/components/layout/AppHeader.tsx"
\`\`\`

### C. Method & Interface List (\`type: interface_list\`)
Structured table for API methods, controller routines, or handler classes.
\`\`\`yaml
methods:
  - name: "fetchUsers"
    params: "limit: number, offset: number"
    returns: "Promise<User[]>"
    line: 45
  - name: "createUser"
    params: "data: CreateUserDto"
    returns: "Promise<User>"
    line: 110
\`\`\`

### D. Database Tables List (\`type: tables_list\`)
Manage table definitions, schemas, typing constraints, and primary or unique index keys.
\`\`\`yaml
tables:
  - name: "users"
    columns:
      - name: "id"
        type: "uuid"
        primary: true
      - name: "email"
        type: "varchar(255)"
        unique: true
      - name: "created_at"
        type: "timestamp"
\`\`\`

### E. Code Snippet Cards (\`type: code_list\`)
Interactive container blocks to store and visually display code snippets.
\`\`\`yaml
snippets:
  - label: "Query Filter"
    language: "typescript"
    code: "const activeUsers = users.filter(u => u.status === 'active');"
\`\`\`

### F. User Story Checklist (\`type: story_list\`)
Tickable checkboxes mapping development features, stories, or functional goals. Checkbox state writes back directly to YAML booleans.
\`\`\`yaml
stories:
  - text: "User can successfully authenticate using OAuth credentials."
    completed: true
  - text: "System enforces strict session expiration after 30 minutes."
    completed: false
\`\`\`

### G. Process Flow List (\`type: flow_list\`)
Numbered sequence of steps mapping controller actions, data loading cycles, or hooks execution flow.
\`\`\`yaml
process:
  - step: 1
    label: "Decrypt Auth Token"
    desc: "Authenticate signature via decrypting standard RSA JWT keys."
  - step: 2
    label: "Authorize Scopes"
    desc: "Validate scope permissions block against requested route attributes."
\`\`\`

---

## 3. Visual Coordination Attributes (\`icon\`, \`color\`)
Ingestalt uses custom aesthetic decorators to color-code cards and fields dynamically:

### A. Lucide Icons (\`icon\`)
Pass any valid Lucide icon string identifier to draw the icon at the top of the node card or field header.
*Popular Examples:*
- \`Database\`, \`Wifi\`, \`Layout\`, \`Activity\`, \`BookOpen\`, \`Cpu\`, \`Layers\`, \`Settings\`, \`Bot\`, \`HardDrive\`, \`Share2\`, \`FileText\`

### B. Theme Accent Colors (\`color\`)
Define visual border and header brand colors in Hex values.
*Recommended Palette:*
- Blue: \`"#3b82f6"\`
- Green: \`"#22c55e"\`
- Purple: \`"#a855f7"\`
- Orange/Amber: \`"#f59e0b"\`
- Teal: \`"#14b8a6"\`
- Rose: \`"#f43f5e"\`

---

## 4. Custom Standards Blueprint Schema (\`type: standards\`)
To define custom note schemas that teammates can load and share, design a standard definition blueprint note using this exact frontmatter syntax:

\`\`\`yaml
title: "Custom Templates Blueprint"
type: "standards"
definitions:
  - id: "microservice"
    type: "Backend Microservice"
    icon: "Cpu"
    color: "#a855f7"
    fields:
      - name: "endpoints"
        type: "interface_list"
        icon: "Zap"
        color: "#a855f7"
      - name: "filepath"
        type: "file_path"
        icon: "FileText"
        color: "#94a3b8"
\`\`\`

---

## 5. Spatial Board Connection Linkages (\`relations\`)
Bi-directional canvas connection edges are automatically persisted inside the note's frontmatter under the \`relations\` key:

\`\`\`yaml
relations:
  - targetId: "node_db_postgres"
    type: "depends_on"
  - targetId: "node_api_auth"
    type: "references"
\`\`\`

Each relation object specifies:
- \`targetId\` (or \`target\`): The unique ID of the target note card.
- \`type\`: The relationship type (e.g. \`depends_on\`, \`implements\`, \`references\`).
- \`metadata\`: Optional additional key-value annotations mapping the relation.

---
*Ingestalt Visual Workspace Engine • High-Fidelity Systems Engineering*
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ingestalt_standards_reference.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'getting-started', label: '01 // INGESTALT', icon: <Sparkles size={13} /> },
    { id: 'interface', label: '02 // ALL THE BUTTONS', icon: <Layers size={13} /> },
    { id: 'canvas', label: '03 // USING THE CANVAS', icon: <Compass size={13} /> },
    { id: 'inspector', label: '04 // INSPECTOR PANEL', icon: <Info size={13} /> },
    { id: 'standards', label: '05 // CREATING STANDARDS', icon: <Component size={13} /> },
    { id: 'ai', label: '06 // AI TASK ENGINEERING', icon: <Bot size={13} /> },
  ] as const;

  const systemConstitution = `# MISSION
You are an AI Architectural Assistant grounded in the Ingestalt Editorial Engineering system. Your goal is to help me maintain a high-fidelity mapping between my architecture documentation and my source code.

# CORE KNOWLEDGE
- Our architecture is documented in the \`_ingestalt\` directory.
- Each node in our system is a Markdown file with YAML frontmatter.
- You MUST prioritize information found in \`_ingestalt\` over your own assumptions about the code.

# YOUR GUIDELINES
1. **Always Check the Standard**: Before suggesting code for a node, check its \`configId\` in \`_ingestalt/standards_core.md\`.
2. **Synchronized Documentation**: If I ask you to update a component, also provide a diff for its corresponding \`.md\` file in \`_ingestalt\`.
3. **Respect Relationships**: When refactoring, look at the \`relations\` in the frontmatter to see what other nodes might be impacted.
4. **Heuristic Awareness**: If I provide you with a prompt from the Ingestalt AI Task Builder, use the surgical context provided to focus ONLY on the selected properties.

# EXECUTION
Ask me to provide the contents of a specific node in \`_ingestalt\` if you are unsure about its current architectural constraints.`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md pointer-events-auto font-mono uppercase text-xs tracking-wider select-none text-foreground">
      {/* Stark Background Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-6xl h-[85vh] bg-background border border-border/20 rounded-none shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header bar */}
        <div className="w-full px-6 py-4 flex justify-between items-center border-b border-border/10 bg-background/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-foreground/50 animate-pulse" />
            <span className="font-black tracking-widest text-xs">INGESTALT // USER_MANUAL_v1.0</span>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-secondary/[0.04] border border-border/10 text-xs font-bold tracking-widest text-muted-foreground">
              BUILT_FOR_THE_IBM_BOB_HACKATHON
            </div>
          </div>
          <button
            onClick={() => setGuideOpen(false)}
            className="p-2 border border-border/10 hover:border-foreground/30 text-foreground/50 hover:text-foreground transition-all rounded-none"
          >
            <X size={14} />
          </button>
        </div>

        {/* Workspace body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Sidebar Menu */}
          <div className="w-64 border-r border-border/10 flex flex-col py-4 gap-1 overflow-y-auto bg-secondary/[0.01] shrink-0">
            <div className="px-4 py-2 text-xs text-muted-foreground font-black tracking-widest">CHAPTERS</div>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all border-l-2 text-xs font-black tracking-wider ${active
                      ? 'border-foreground bg-secondary/[0.04] text-foreground font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/[0.01]'
                    }`}
                >
                  <span className={active ? 'text-foreground' : 'text-muted-foreground/50'}>
                    {tab.icon}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Pane */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 select-text leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 max-w-4xl"
              >
                {activeTab === 'getting-started' && (
                  <div className="space-y-10">

                    {/* Hero header */}
                    <div>
                      <div className="text-xs tracking-widest text-foreground/70 font-black mb-3">CHAPTER_01 // WELCOME</div>
                      <h1 className="text-4xl font-black tracking-widest text-foreground uppercase leading-none">
                        WHAT IS INGESTALT?
                      </h1>
                      <p className="text-foreground/90 text-xs leading-relaxed max-w-xl mt-4">
                        A local-first canvas that turns your Markdown files into a living, visual map of your project.
                      </p>
                      <p className="text-foreground/80 text-xs leading-relaxed max-w-xl mt-1">
                        Your data never leaves your machine. Ingestalt reads directly from your disk using secure sandboxed browser handles, ensuring complete offline privacy.
                      </p>
                    </div>

                    {/* Divider label */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border/15" />
                      <span className="text-xs font-black tracking-widest text-foreground/70">WHERE DO YOU START?</span>
                      <div className="h-px flex-1 bg-border/15" />
                    </div>

                    {/* Two scenario cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Scenario A — existing docs */}
                      <div className="relative border border-border/12 bg-secondary/[0.02] p-6 pl-8 flex flex-col gap-5">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/30" />

                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-border/12 bg-secondary/[0.04]">
                            <FileText className="w-4 h-4 text-foreground/70" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-foreground uppercase tracking-wide">"I have an existing project folder"</div>
                          </div>
                        </div>

                        {/* PromptModal-like Boxed Segment list */}
                        <div className="flex flex-col gap-2">
                          <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] text-xs text-foreground/85 leading-relaxed">
                            You have existing Markdown files — component specs, API notes, user stories, anything.
                          </div>
                          <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] text-xs text-foreground/85 leading-relaxed">
                            Use the inspector to add structured properties—schemas, endpoints, flows—saved as clean frontmatter YAML.
                          </div>
                        </div>

                        <div className="border-t border-border/10 pt-3 flex items-start gap-2.5">
                          <Zap className="w-4 h-4 text-foreground/70 mt-0.5 shrink-0" />
                          <span className="text-xs text-foreground/90 font-black">Your IDE reads and writes these files too — everything stays in sync.</span>
                        </div>
                      </div>

                      {/* Scenario B — starting fresh */}
                      <div className="relative border border-border/12 bg-secondary/[0.02] p-6 pl-8 flex flex-col gap-5">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/30" />

                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-border/12 bg-secondary/[0.04]">
                            <Sparkles className="w-4 h-4 text-foreground/70" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-foreground uppercase tracking-wide">"I am starting fresh from scratch"</div>
                          </div>
                        </div>

                        {/* PromptModal-like Boxed Segment list */}
                        <div className="flex flex-col gap-2">
                          <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] text-xs text-foreground/85 leading-relaxed">
                            No files yet? That's fine — Ingestalt is built for this too.
                          </div>
                          <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] text-xs text-foreground/85 leading-relaxed">
                            Ask your AI or IDE to generate the Markdown files. Nodes are fully customizable — this doesn't have to be about software.
                          </div>
                          <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] text-xs text-foreground/85 leading-relaxed">
                            Once the files exist, connect the folder and they appear on the canvas instantly.
                          </div>
                        </div>

                        <div className="border-t border-border/10 pt-3 flex items-start gap-2.5">
                          <Bot className="w-4 h-4 text-foreground/70 mt-0.5 shrink-0" />
                          <span className="text-xs text-foreground/90 font-black">Use the Prompts Library inside Ch. 06 to get your AI assistant aligned fast.</span>
                        </div>
                      </div>
                    </div>

                    {/* The Three Things it Does Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">THE THREE THINGS IT DOES</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      <div className="space-y-4">
                        {/* Item 1 */}
                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <h4 className="font-black text-xs text-foreground mb-2 flex items-center gap-2">
                            <Layers size={14} className="text-muted-foreground" />
                            LOCAL FILES, ALWAYS
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your code lives on your computer. Ingestalt reads directly from your hard drive, keeping everything 100% offline, private, and secure.
                          </p>
                        </div>

                        {/* Item 2 */}
                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <h4 className="font-black text-xs text-foreground mb-2 flex items-center gap-2">
                            <Compass size={14} className="text-muted-foreground" />
                            CANVAS WORKSPACE
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Visualize connections between components, schemas, requirements, and AI prompts. Move beyond flat folders and see the architecture.
                          </p>
                        </div>

                        {/* Item 3 */}
                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <h4 className="font-black text-xs text-foreground mb-2 flex items-center gap-2">
                            <RefreshCw size={14} className="text-muted-foreground" />
                            BIDIRECTIONAL SYNC
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Edit in Ingestalt, and it saves to disk. Edit in VS Code, and Ingestalt updates. It's a living visual map of your physical codebase.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Grounding & Sync Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">AUTHORIZATION & LOCAL FILE SYNC</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      <div className="space-y-4">
                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <h4 className="font-black text-xs text-foreground mb-2 flex items-center gap-2">
                            <Network size={14} className="text-muted-foreground" />
                            FILE SYSTEM ACCESS (FSA) PERMISSIONS
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Ingestalt leverages secure W3C drivers. Grant permissions once, and the app reads directly from your hard drive without any external cloud syncing.
                          </p>
                        </div>

                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <h4 className="font-black text-xs text-foreground mb-2 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-amber-400" />
                            THE ORANGE "RE-AUTH" DE-COUPLING BADGE
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            For security, browser engines scrub filesystem handles when you refresh. Simply click the amber <strong className="text-amber-400 bg-amber-500/10 px-1 py-0.5">RE-AUTH</strong> badge to instantly restore the connection.
                          </p>
                        </div>

                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <h4 className="font-black text-xs text-foreground mb-2 flex items-center gap-2">
                            <RefreshCw size={14} className="text-muted-foreground" />
                            HEARTBEAT SCAN RATE
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Sync changes without manual refreshing. Set a heartbeat sync rate (<strong className="text-foreground">5S</strong>, <strong className="text-foreground">10S</strong>, <strong className="text-foreground">30S</strong>) in the top dropdown to automatically scan for IDE modifications.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {activeTab === 'interface' && (
                  <div className="space-y-10">

                    {/* Chapter Title */}
                    <div>
                      <div className="text-xs tracking-widest text-foreground/70 font-black mb-3">CHAPTER_02 // SYSTEM_UI</div>
                      <h1 className="text-4xl font-black tracking-widest text-foreground uppercase leading-none">
                        WORKSPACE & INTERFACE
                      </h1>
                      <p className="text-foreground/90 text-xs leading-relaxed max-w-xl mt-4">
                        Ingestalt uses a split-pane, tactile coordinate system. It integrates two persistent workspace panels with two floating, draggable control bar systems around an infinite central viewport.
                      </p>
                    </div>

                    {/* Panels Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">THE THREE PERSPECTIVES</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="relative border border-border/12 bg-secondary/[0.02] p-5 pl-7 flex flex-col gap-2">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400/60" />
                          <div className="font-black text-xs text-foreground flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            [1] LEFT SIDEBAR
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            A monospaced utility panel housing your Canvas directory, a draggable Palette of core/custom templates, and a searchable library of active nodes. Click any header tab to collapse it.
                          </p>
                        </div>

                        <div className="relative border border-border/12 bg-secondary/[0.02] p-5 pl-7 flex flex-col gap-2">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/30" />
                          <div className="font-black text-xs text-foreground flex items-center gap-2">
                            <Compass className="w-3.5 h-3.5 text-foreground/60" />
                            [2] CENTRAL CANVAS
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            The infinite React Flow grid where your visual mind-map lives. Draw edges to map pathways, double-click empty space to focus, and drag nodes directly onto the grid.
                          </p>
                        </div>

                        <div className="relative border border-border/12 bg-secondary/[0.02] p-5 pl-7 flex flex-col gap-2">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-400/60" />
                          <div className="font-black text-xs text-foreground flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            [3] RIGHT INSPECTOR
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            Slides in from the right edge when a node is selected. Controls YAML metadata frontmatter, active edge pathways, dynamic object list schemas, and specialized AI sync prompts.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Left Sidebar Breakdown */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">THE UTILITY SIDEBAR TABS</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      <div className="space-y-4">
                        {/* Tab 1: Canvas */}
                        <div className="border border-border/10 bg-secondary/[0.01] p-4 flex flex-col gap-3">
                          <div className="font-black text-xs text-foreground flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            CANVAS DIRECTORY
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            Organize, snapshot, and transfer visual workspaces.
                          </p>
                          <ul className="flex flex-col gap-2 text-xs text-foreground/85 pl-1.5">
                            <li className="flex items-center gap-2">
                              <Plus className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                              <span><strong className="text-foreground">Plus:</strong> Creates a fresh new workspace canvas.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Upload className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span><strong className="text-foreground">Upload:</strong> Imports an Atlas configuration.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Save className="w-3.5 h-3.5 text-green-400 shrink-0" />
                              <span><strong className="text-foreground">Save:</strong> Checkpoints current node positions.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <RotateCcw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span><strong className="text-foreground">Rotate:</strong> Reverts positions to the saved snapshot.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Download className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span><strong className="text-foreground">Download:</strong> Exports workspace as an Atlas file.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span><strong className="text-foreground">Trash:</strong> Purges canvas and all nodes in its workspace.</span>
                            </li>
                          </ul>

                          {/* Atlas Subsegment */}
                          <div className="mt-2.5 border-t border-border/10 pt-3 pl-2.5 relative flex flex-col gap-2">
                            <div className="absolute left-0 top-3 bottom-0 w-0.5 bg-blue-400/40" />
                            <div className="font-black text-xs text-foreground uppercase tracking-widest flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                              Under the Hood: Ingestalt Atlas
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              An <strong className="text-foreground">Atlas</strong> is a portable, offline bundle of a saved canvas. It packages all nodes, layout coordinates, metadata state, and connections into a single JSON file.
                            </p>
                            <p className="text-xs text-foreground/75 leading-relaxed">
                              Use it to share maps with teammates, back up complex layouts, or port entire workspaces to different instances of Ingestalt instantly. Just export a canvas using <strong className="text-foreground">Download Atlas</strong> and reload it elsewhere via <strong className="text-foreground">Import Atlas</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Tab 2: Palette */}
                        <div className="border border-border/10 bg-secondary/[0.01] p-4 flex flex-col gap-3">
                          <div className="font-black text-xs text-foreground flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            ARCHITECTURAL PALETTE
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            Drag and drop template models directly onto the central canvas to inject new entities:
                          </p>
                          <ul className="flex flex-col gap-2 text-xs text-foreground/85 pl-1.5">
                            <li className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
                              <span><strong className="text-foreground">Note:</strong> Creates a standard Markdown document element.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span><strong className="text-foreground">Record:</strong> Represents structured datasets and record tables.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span><strong className="text-foreground">Standards:</strong> Registers schema blueprints and auto-registered types.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span><strong className="text-foreground">AI Task:</strong> Executes automated prompts and workspace actions.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Tab 3: Nodes */}
                        <div className="border border-border/10 bg-secondary/[0.01] p-4 flex flex-col gap-3">
                          <div className="font-black text-xs text-foreground flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-foreground/60" />
                            ENTITY DIRECTORY
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            Global query filter and spatial locator for active nodes.
                          </p>
                          <ul className="flex flex-col gap-2 text-xs text-foreground/85 pl-1.5">
                            <li className="flex items-center gap-2">
                              <Search className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                              <span><strong className="text-foreground">Dynamic Filter:</strong> Queries active workspace nodes instantly by title.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                              <span><strong className="text-foreground">Click-to-Focus:</strong> Selects a node and pans the viewport directly over it.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Floating Main Toolbar */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">FLOATING MAIN TOOLBAR (TOP)</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed -mt-1">
                        Located at the top center, this collapsible island controls systems sync, themes, relations visibility, and folder permissions.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <ZapOff className="w-3.5 h-3.5 text-foreground/60" />
                            TOGGLE PALETTE
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Collapses or expands the Left Sidebar to maximize workspace real estate.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <Moon className="w-3.5 h-3.5 text-foreground/60" />
                            THEME SWITCHER
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Cycles immediately between dark and high-contrast light mode UI palettes.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            LIVE PUSH (OPT-IN)
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Forces Ingestalt to write back node changes directly to local Markdown files.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-green-400 flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 text-green-400" />
                            AUTO-PULL SYNC
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Sets a background heartbeat rate (5s, 10s, 30s) to index external IDE updates.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                            LINK FOLDER / RE-AUTH
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Grants File System directory permissions. Shows a pulsing orange badge if authorization needs approval.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-purple-400 flex items-center gap-2">
                            <Share2 className="w-3.5 h-3.5 text-purple-400" />
                            EDGE ROUTING ENGINE
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Alters path drawing styles: organic curvature, circuit routing, or obstacle avoidance.</p>
                        </div>
                      </div>
                    </div>

                    {/* Batch Action Toolbar */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">BATCH ACTION TOOLBAR (BOTTOM)</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed -mt-1">
                        Pops up from the bottom center only when one or more nodes are selected, providing high-speed workspace automation.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <Copy className="w-3.5 h-3.5 text-foreground/70" />
                            COPY MARKDOWN
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Compiles all selected nodes chronologically into a single, clean Markdown clipboard stream.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-foreground flex items-center gap-2">
                            <Files className="w-3.5 h-3.5 text-foreground/70" />
                            DUPLICATE SELECTION
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Clones selected nodes and duplicate their interconnecting relationship paths with offset spacing.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-emerald-400 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            STANDALONE WIKI GENERATOR
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Generates a production-grade documentation portal. Outputs a single HTML with interactive navigation.</p>
                        </div>
                        <div className="px-4 py-3 border border-border/10 bg-secondary/[0.01] space-y-1">
                          <div className="text-xs font-black text-amber-400 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            AUTOLAYOUT SELECTION
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">Automatically spaces and grids selection based on Column Width, Vertical Gap, and Nesting depth parameters.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}


                {activeTab === 'canvas' && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs tracking-widest text-muted-foreground font-black mb-1">CHAPTER_03 // SPATIAL</div>
                      <h1 className="text-3xl font-black tracking-widest text-foreground/90 uppercase leading-none pb-1">
                        THE SPATIAL CANVAS
                      </h1>
                      <p className="text-muted-foreground text-xs leading-relaxed max-w-2xl mt-3 uppercase">
                        The visual blueprint of your structural mind-map. Nodes are placed on an infinite grid, linked by relational edge routing algorithms.
                      </p>
                    </div>

                    {/* Dynamic Choose Your Path Selector */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-black text-xs text-foreground uppercase tracking-widest">
                          CHOOSE YOUR PATH: WHAT ARE WE CREATING?
                        </h3>
                        <p className="text-xs text-foreground/75 leading-relaxed">
                          Select your primary objective to view a highly-optimized spatial map onboarding sequence.
                        </p>
                      </div>

                      {/* 6-Column Selector Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => setWorkflowPath('scratch')}
                          className={`p-2.5 border text-xs font-black uppercase flex items-center justify-start gap-2 transition-all ${workflowPath === 'scratch' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-secondary/[0.01] border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20'}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>1. FRESH BOARD</span>
                        </button>
                        <button
                          onClick={() => setWorkflowPath('wiki')}
                          className={`p-2.5 border text-xs font-black uppercase flex items-center justify-start gap-2 transition-all ${workflowPath === 'wiki' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-secondary/[0.01] border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20'}`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>2. MESSY FOLDER</span>
                        </button>
                        <button
                          onClick={() => setWorkflowPath('atlas')}
                          className={`p-2.5 border text-xs font-black uppercase flex items-center justify-start gap-2 transition-all ${workflowPath === 'atlas' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-secondary/[0.01] border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20'}`}
                        >
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          <span>3. LOAD BACKUP</span>
                        </button>
                        <button
                          onClick={() => setWorkflowPath('schema')}
                          className={`p-2.5 border text-xs font-black uppercase flex items-center justify-start gap-2 transition-all ${workflowPath === 'schema' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-secondary/[0.01] border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20'}`}
                        >
                          <Cpu className="w-3.5 h-3.5 shrink-0" />
                          <span>4. DATA SCHEMAS</span>
                        </button>
                        <button
                          onClick={() => setWorkflowPath('ai')}
                          className={`p-2.5 border text-xs font-black uppercase flex items-center justify-start gap-2 transition-all ${workflowPath === 'ai' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-secondary/[0.01] border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20'}`}
                        >
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          <span>5. AI DRAFTING</span>
                        </button>
                        <button
                          onClick={() => setWorkflowPath('publish')}
                          className={`p-2.5 border text-xs font-black uppercase flex items-center justify-start gap-2 transition-all ${workflowPath === 'publish' ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-secondary/[0.01] border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20'}`}
                        >
                          <Share2 className="w-3.5 h-3.5 shrink-0" />
                          <span>6. WIKI PUBLISH</span>
                        </button>
                      </div>

                      {/* Dynamic Workflow Stages Content */}
                      <div className="flex flex-col gap-2.5 mt-1">

                        {/* PATH 1: START FROM SCRATCH */}
                        {workflowPath === 'scratch' && (
                          <>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 01: Open a Blank Board</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Open the Left Sidebar, select the <strong className="text-foreground">Canvas Tab</strong>, and click the <strong className="text-foreground">Plus</strong> icon to initialize a completely clean workspace view.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 02: Deploy Template Cards</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Open the <strong className="text-foreground">Palette Tab</strong> inside the Left Sidebar. Drag starting nodes like <strong className="text-foreground">Note</strong> or <strong className="text-foreground">Record</strong> and drop them directly onto the infinite grid space.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 03: Wire Relationships</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Hover over any card to reveal its circular outer handles. Click and drag a connection line out from one handle and drop it directly onto another handle to establish logical wires.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 04: Dyna-Grid Alignment</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Select all nodes using <strong className="text-foreground">Ctrl + A</strong> or <strong className="text-foreground">Shift + Drag Box</strong>. Click the <strong className="text-foreground">Sparkles</strong> Autolayout tool inside the bottom toolbar to instantly format them into clean structured columns.
                              </p>
                            </div>
                          </>
                        )}

                        {/* PATH 2: VISUALIZE MESSY FOLDER */}
                        {workflowPath === 'wiki' && (
                          <>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 01: Connect Folder Resources</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Click <strong className="text-foreground">Link Folder</strong> (or the pulsing orange <strong className="text-foreground">Re-Auth</strong> badge) on the top Floating Toolbar to grant filesystem access to your local Markdown directory.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 02: Scan & Index Existing Notes</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Open the Left Sidebar's <strong className="text-foreground">Nodes Tab</strong> and click the <strong className="text-foreground">Plus</strong> Discovery button to crawl your directory. All existing `.md` files will instantly index into the local list.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 03: Populate Spatially</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Drag documents from the sidebar listing directly onto the canvas grid, laying them out visually as interactive entity cards.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 04: Auto-Inject Markdown Links</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Wire related notes together by dragging lines between circular boundary handles. Connecting them physically automatically writes relative markdown link tags inside the underlying files!
                              </p>
                            </div>
                          </>
                        )}

                        {/* PATH 3: RESTORE ATLAS BACKUP */}
                        {workflowPath === 'atlas' && (
                          <>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 01: Import Atlas JSON</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Go to the Left Sidebar's <strong className="text-foreground">Canvas Tab</strong> and click the <strong className="text-foreground">Upload</strong> button. Select a shared `.json` Atlas document to rebuild coordinates and paths instantly.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 02: Re-link File Sources</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Click <strong className="text-foreground">Link Folder</strong> on the Floating Toolbar and link the corresponding directory so Ingestalt knows where to read the active text contents of the imported nodes.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 03: Checkpoint and Save</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Click <strong className="text-foreground">Save</strong> inside the Canvas Sidebar tab to persist the imported layout to your local database so it remains intact and accessible across sessions.
                              </p>
                            </div>
                          </>
                        )}

                        {/* PATH 4: SOFTWARE DATA SCHEMAS */}
                        {workflowPath === 'schema' && (
                          <>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 01: Build Data entities</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Drag <strong className="text-foreground">Standards</strong> and <strong className="text-foreground">Record</strong> models from the Left Palette tab directly onto the infinite spatial canvas.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 02: Map Schema Flow</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Connect entities showing how information moves (e.g., wiring an API Endpoint node down to a relational database table or hook event).
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 03: Configure frontmatter validation</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Select a card, slide out the <strong className="text-foreground">Right Inspector</strong>, and write data schemas, validation constraints, and variable scopes inside the YAML frontmatter.
                              </p>
                            </div>
                          </>
                        )}

                        {/* PATH 5: RUN AI BATCH DRAFTING */}
                        {workflowPath === 'ai' && (
                          <>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 01: Deploy AI Task Cards</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Drag an <strong className="text-foreground">AI Task</strong> template node from the Left Palette onto the canvas. Double-click it to input a custom background instruction or LLM prompt.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 02: Feed Context Documents</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Draw relationship wires from standard document cards into the AI Task card. The AI Task card will automatically assemble these wired notes as its reference prompt context.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 03: Compile Rich Prompt Context</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Select the AI Task node to compile your spatial relationships, YAML properties, and linked schemas into a beautifully structured, highly informed gray-matter prompt context.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 04: Execute in Bob IDE</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Copy the compiled visual context code block from the Right Inspector and execute it inside <strong className="text-foreground">IBM Bob IDE</strong> to let your developer AI model generate and write physical files instantly.
                              </p>
                            </div>
                          </>
                        )}

                        {/* PATH 6: PUBLISH DOCUMENTATION WIKI */}
                        {workflowPath === 'publish' && (
                          <>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 01: Polish Board Alignment</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Group and align your mind-map using the selection box (`Shift + Drag Box`) and layout tool (`Sparkles`). Choose a wire style (Curved Organic, Smart, or Circuit Grid) from the top toolbar.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 02: Compile Offline Wiki</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Highlight the workspace nodes and click <strong className="text-foreground">Standalone Wiki Generator</strong> (`FileText`) on the bottom Batch Toolbar.
                              </p>
                            </div>
                            <div className="relative border border-border/10 bg-secondary/[0.01] p-4 pl-7 flex flex-col gap-1">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400" />
                              <div className="font-black text-xs text-foreground uppercase">Stage 03: Distribute Interactive SPA</div>
                              <p className="text-xs text-foreground/80 leading-relaxed">
                                Open the generated single HTML document. Share it offline or host it anywhere: it features rapid sidebar file browsing, dynamic global search queries, and fully-interactive graph layouts!
                              </p>
                            </div>
                          </>
                        )}

                      </div>
                    </div>

                    {/* IBM Bob IDE & Filesystem Integration Highlight */}
                    <div className="relative border border-border/10 bg-secondary/[0.02] p-4.5 pl-8 flex flex-col gap-2">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />
                      
                      <div className="font-black text-xs text-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        Developer Integration: Leveraging IBM Bob IDE & Local Filesystem
                      </div>
                      
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        To unlock the ultimate engineering workflow, keep <strong className="text-foreground">IBM Bob IDE</strong> open side-by-side with Ingestalt. While Ingestalt serves as your spatial blueprint, database validator, and interactive visual graph, Bob IDE serves as your physical file constructor.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1.5 text-xs text-foreground/80 leading-relaxed">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            Pre-scaffolding Blank Files:
                          </span>
                          <span>
                            Since Ingestalt's local syncing engine requires existing files to persist coordinates, use Bob IDE to initialize your Markdown structures. Once saved on disk, hit the Toolbar's <strong className="text-foreground">Plus</strong> Discovery button to index and place them instantly.
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            AI-Assisted Blueprint Generation:
                          </span>
                          <span>
                            Assemble complex relations, schemas, and context notes visually inside Ingestalt's AI Task nodes to construct the perfect blueprint prompt. Copy this grey-matter blueprint into IBM Bob IDE to generate files instantly!
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edge Routing Cards */}
                    <div>
                      <h3 className="font-black text-xs text-foreground uppercase tracking-widest mb-3">
                        Dynamic Edge Routing Algorithms
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1">
                          <div className="font-black text-xs text-blue-400 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5" />
                            CIRCUIT ROUTE
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">
                            Orthogonal, grid-aligned blue-print pathways for a high-fidelity technical visualization structure.
                          </p>
                        </div>
                        <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1">
                          <div className="font-black text-xs text-amber-400 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5" />
                            SMART ROUTE
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">
                            Obstacle avoidance engine that automatically snakes and routes wires around existing blockages.
                          </p>
                        </div>
                        <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1">
                          <div className="font-black text-xs text-purple-400 flex items-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5" />
                            ORGANIC
                          </div>
                          <p className="text-xs text-foreground/80 leading-normal">
                            Clean, curved Bezier routing delivering natural flow and intuitive logical mappings.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Portability & Outputs Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">EXPORTING, SHARING & PORTABILITY</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <Camera className="w-5 h-5 text-foreground/50 mb-3" />
                          <h4 className="font-black text-xs text-foreground mb-2">CANVAS SCREENSHOTS</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Click the camera icon to save high-fidelity PNG captures. The system isolates and disables canvas filters/blurs for clean publications.
                          </p>
                        </div>

                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <Network className="w-5 h-5 text-foreground/50 mb-3" />
                          <h4 className="font-black text-xs text-foreground mb-2">INTERACTIVE WIKIS</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Select nodes and click the "Standalone Wiki" icon on the bottom toolbar. Generates a standalone, zero-dependency HTML site with active navigation.
                          </p>
                        </div>

                        <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                          <Layers className="w-5 h-5 text-foreground/50 mb-3" />
                          <h4 className="font-black text-xs text-foreground mb-2">BATCH CONTEXT</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Shift+Drag to select multiple nodes. Click "Copy Markdown" on the bottom toolbar to compile a clean continuous thread to your clipboard.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verified Keyboard Shortcuts Grid */}
                    <div className="border border-border/10 p-5 bg-secondary/[0.02]">
                      <h3 className="font-black text-xs text-foreground mb-3.5 flex items-center gap-2">
                        <Keyboard className="w-3.5 h-3.5 text-foreground/60" />
                        KEYBOARD SHORTCUTS
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                        {/* Section 1: Canvas Utilities */}
                        <div className="space-y-1.5">
                          <div className="font-black text-xs text-foreground/50 border-b border-border/10 pb-1 uppercase tracking-wider">Canvas & Views</div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + P</span><span className="text-foreground/80">Toggle Palette Tab</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + K / F</span><span className="text-foreground/80">Toggle Global Search</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + B</span><span className="text-foreground/80">Toggle Left Sidebar</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + I</span><span className="text-foreground/80">Toggle Inspector Pane</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + E</span><span className="text-foreground/80">Cycle Edge Routing Styles</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + Shift + T</span><span className="text-foreground/80">Toggle App Theme</span></div>
                        </div>

                        {/* Section 2: Node Actions */}
                        <div className="space-y-1.5">
                          <div className="font-black text-xs text-foreground/50 border-b border-border/10 pb-1 uppercase tracking-wider">Node & Edge Manipulation</div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Shift + Drag Box</span><span className="text-foreground/80">Multi-Node Selection</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + C / V</span><span className="text-foreground/80">Copy & Paste Selected Nodes</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + D</span><span className="text-foreground/80">Duplicate Selection with Offsets</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + A</span><span className="text-foreground/80">Select All Canvas Nodes</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Backspace / Delete</span><span className="text-foreground/80">Delete Selected Nodes</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Escape</span><span className="text-foreground/80">Deselect / Close Inspector</span></div>
                          <div className="flex justify-between py-1"><span className="font-bold text-foreground">Enter (on Node)</span><span className="text-foreground/80">Open Inspector Properties</span></div>
                        </div>

                        {/* Section 3: Navigation */}
                        <div className="space-y-1.5 sm:col-span-2 mt-2">
                          <div className="font-black text-xs text-foreground/50 border-b border-border/10 pb-1 uppercase tracking-wider">Viewport Navigation</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-xs">
                            <div className="flex justify-between py-1"><span className="font-bold text-foreground">Double-Click Canvas / Ctrl + 0</span><span className="text-foreground/80">Fit View to Entire Graph</span></div>
                            <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + Shift + 0</span><span className="text-foreground/80">Fit View to Selected Node</span></div>
                            <div className="flex justify-between py-1"><span className="font-bold text-foreground">Ctrl + 1</span><span className="text-foreground/80">Reset Zoom to 100% Scale</span></div>
                            <div className="flex justify-between py-1"><span className="font-bold text-foreground">Arrow Keys / Shift + Arrows</span><span className="text-foreground/80">Pan View (50px / 200px fast)</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inspector' && (
                  <div className="space-y-8">
                    <div>
                      <div className="text-xs tracking-widest text-foreground/70 font-black mb-3">CHAPTER_04 // INSPECTOR</div>
                      <h1 className="text-3xl font-black tracking-widest text-foreground uppercase leading-none">
                        THE MODULAR INSPECTOR
                      </h1>
                      <p className="text-xs text-foreground/80 leading-relaxed max-w-2xl mt-3">
                        The Inspector is Ingestalt's real-time parameter command deck. Slid out from the right workspace margin, it dynamically adapts to the selected node's schema—exposing five highly specialized engineering workspaces.
                      </p>
                    </div>

                    {/* Section: Header Controls */}
                    <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-8 relative flex flex-col gap-3">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/30" />
                      <h4 className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                        <HardDrive size={15} className="text-foreground/60" />
                        Node Header & Parameter Controls
                      </h4>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        At the very top of the inspector, you manage the node's core identity, visual properties, and local filesystem link:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs leading-relaxed text-foreground/70">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">Title & Filename Inputs:</span>
                          <span>Change the visual card title instantly, or map the node to its target physical markdown file path on disk (e.g. <code className="text-foreground bg-secondary/[0.04] px-1 font-mono text-[10px]">db_schema.md</code>).</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">Standard / Type Dropdown:</span>
                          <span>Re-classify node archetypes (Note, Record, AI Task) or select a pre-defined Standard to instantly inherit structured schemas.</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">Visual Stylers (Icon & Accent Color):</span>
                          <span>Pick custom Lucide icons and tailored colors to coordinate color-coded nodes on the board.</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground">Mode Switcher (Eye / Edit):</span>
                          <span>Toggle between <strong className="text-foreground">Preview Mode</strong> (renders marked Markdown) and <strong className="text-foreground">Edit Mode</strong> (opens the interactive WYSIWYG editor).</span>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2 border-t border-border/10 pt-2 mt-1">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Save className="w-3.5 h-3.5" />
                            Manual Save File:
                          </span>
                          <span>When auto-sync is off, hit the blue <strong className="text-foreground">Save to Disk</strong> button to manually compile changes and write the YAML frontmatter and content directly to the local filesystem handle.</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Tab 1: Content Editor */}
                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-8 relative flex flex-col gap-3">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sky-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                          <FileText size={15} className="text-sky-400" />
                          01. The Documentation Workspace (Markdown Editor)
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          Ingestalt features a fluid, high-fidelity WYSIWYG Tiptap editor. Writing free-form content automatically schedules auto-save triggers, writing back to your physical file handle on disk.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 text-xs">
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              Slash Commands (/)
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Type <code className="text-foreground bg-secondary/[0.04] px-1 font-mono text-[10px]">/</code> to trigger an editor command menu to quickly insert tables, task checklists, headers, and code block components.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              Interactive Tables
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Create grid tables with add/delete row and column options. They are translated into clean Markdown tables in the physical file.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              Base64 Images
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Paste screenshots or drag-and-drop image files directly into the editor: they are instantly converted into Base64 strings and saved directly inside the file.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tab 2: Relationships */}
                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-8 relative flex flex-col gap-3">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                          <Share2 size={15} className="text-emerald-400" />
                          02. The Relationships Workspace (Bi-Directional Linker)
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          Ingestalt compiles visual relationships bi-directionally without requiring you to manually edit raw frontmatter YAML tags. You can add, manage, and sever links visually:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 text-xs">
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 text-emerald-400" />
                              Add Connection
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Click <strong className="text-foreground">Add Relation</strong> and select a card from the autocomplete search lists to wire a link instantly.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-emerald-400" />
                              Link Category
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Designate relationships as <strong className="text-foreground">Depends On</strong> (blockers), <strong className="text-foreground">Implements</strong> (spec to code), or <strong className="text-foreground">References</strong> to dictate the graph's wire routing and aesthetics.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                              Delete Wire
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Sever links directly by clicking the trash button, detaching visual edges and updating relationships index immediately.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tab 3: Properties */}
                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-8 relative flex flex-col gap-3">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                          <Component size={15} className="text-amber-400" />
                          03. The Properties Workspace (Dynamic Schema Editor)
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          The frontmatter metadata editor. Instead of editing raw YAML text block by block, this panel generates interactive UI inputs (like checkboxes, toggles, or dynamic rows) to edit properties visually:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 text-xs">
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 text-amber-400" />
                              Add Custom Attribute
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Spawns custom config fields, checklist arrays, story objectives, or variable scopes in the frontmatter.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              Jump to Code (⚡)
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Trigger the lightning bolt deep-link to actively open the node's physical file directly inside your coding IDE like VS Code or IBM Bob IDE.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                              Remove Attribute
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Clean up unused properties or deprecated frontmatter attributes securely from the source note.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tab 4: AI Tasks Prompt Builder */}
                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-8 relative flex flex-col gap-3">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                          <Bot size={15} className="text-indigo-400" />
                          04. The AI Prompt Builder Workspace (AI Tasks)
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          Your surgical prompt compiler. Rather than running LLM generation blindly inside Ingestalt, this panel gathers your spatial graph dependencies, YAML property models, and markdown instructions into a highly dense, context-rich developer prompt blueprint.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-xs">
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              Surgical Selection Checkboxes
                            </span>
                            <span className="text-foreground/70 leading-relaxed">
                              Individually toggle which variables, markdown sections, or connected context files should be included. Avoid context limit bloat and restrict instructions strictly to relevant logical nodes.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              IDE Prompt Deployment
                            </span>
                            <span className="text-foreground/70 leading-relaxed">
                              Click <strong className="text-foreground">Copy Prompt</strong> to harvest a dense, structured system instructions sheet. Paste it into your IDE assistant (like <strong className="text-foreground">IBM Bob IDE</strong>) to scaffold physical files with perfect context!
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tab 5: Node Types Editor */}
                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-8 relative flex flex-col gap-3">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                          <Settings2 size={15} className="text-rose-400" />
                          05. The Node Types Editor
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          Visible exclusively when editing <strong className="text-foreground">type: standards</strong> nodes. This panel houses the custom configurator that manages standard note type configurations across your workspace:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 text-xs">
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 text-rose-400" />
                              Add Custom Definition
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Create new custom types (Database schemas, API endpoints, Requirement checklists) using pre-defined base templates.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-rose-400" />
                              Field Schema Configurator
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Define properties field names, custom types (text, lists, checklists, API flow parameters), visual icons, and specific colors.
                            </span>
                          </div>
                          <div className="p-3 bg-secondary/[0.01] border border-border/10 flex flex-col gap-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-rose-400" />
                              AI Template Prompt
                            </span>
                            <span className="text-foreground/70 leading-normal">
                              Set custom system prompt instructions templates mapped to nodes using this Standard to generate perfect visual models.
                            </span>
                          </div>
                        </div>

                        <div className="text-xs bg-secondary/[0.01] border border-border/10 p-3 mt-1 text-foreground/80 leading-relaxed">
                          <strong className="text-foreground">Decentralized Sharing & Auto-Registration:</strong> Custom standard templates are stored as standard Markdown files. When you load a directory or import standard cards onto a board, Ingestalt automatically parses and registers the definitions on the fly. This makes it incredibly easy to share and distribute your bespoke architecture schemas with teammates just by passing around raw note files!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'standards' && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div>
                      <div className="text-xs tracking-widest text-foreground/70 font-black mb-3">CHAPTER_05 // INTERPRET</div>
                      <h1 className="text-3xl font-black tracking-widest text-foreground uppercase leading-none">
                        SUPPORTED DYNAMIC DATA STANDARDS
                      </h1>
                      <p className="text-xs text-foreground/80 leading-relaxed max-w-2xl mt-3">
                        Ingestalt operates a dynamic, metadata-driven schema interpreter. Visually design custom node templates inside the visual editor, or customize raw Markdown files to instantly sync interactive properties panels with your source code.
                      </p>
                    </div>

                    {/* Download Button Component */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={downloadReferenceGuide}
                        className="group flex items-center justify-center gap-2 px-5 py-3 border border-border/10 hover:border-amber-400/40 bg-secondary/[0.03] text-foreground hover:text-amber-400 transition-all font-bold text-xs uppercase rounded-none tracking-widest"
                      >
                        <Download size={14} className="text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                        Download Standards Reference Guide (.md)
                      </button>
                    </div>

                    {/* PART 1: VISUAL STANDARDS DESIGN GUIDE */}
                    <div className="border border-border/10 p-6 bg-secondary/[0.01] relative pl-8">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Settings2 className="text-amber-500 w-5 h-5" />
                        <h2 className="text-sm font-black tracking-wider text-foreground uppercase">
                          PART 01: VISUAL STANDARDS DESIGN (THE NODE TYPES EDITOR)
                        </h2>
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        When editing a node with <strong className="text-foreground">type: standards</strong>, the Inspector opens the visual <strong className="text-foreground">Node Types Editor</strong>. Instead of writing raw files manually, you can visually customize note properties here using simple form fields.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="border border-border/10 p-4 bg-background/30 rounded-sm">
                          <h3 className="font-bold text-xs text-foreground uppercase mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                            Core Header Customization
                          </h3>
                          <ul className="space-y-2 text-xs text-foreground/80 leading-relaxed">
                            <li><strong className="text-foreground">Type ID:</strong> The shorthand key (e.g. <code className="text-amber-300 font-mono">microservice</code>) targeted by notes inside their frontmatter <code className="text-amber-300 font-mono">configId</code> to inherit this style.</li>
                            <li><strong className="text-foreground">Category:</strong> The visual card title displayed in active headers (e.g., <span className="italic text-foreground">Backend Service</span>).</li>
                            <li><strong className="text-foreground">Accent & Icon:</strong> Choose custom border accent colors and Lucide icons to brand your node.</li>
                          </ul>
                        </div>

                        <div className="border border-border/10 p-4 bg-background/30 rounded-sm">
                          <h3 className="font-bold text-xs text-foreground uppercase mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                            AI System Prompt Templates
                          </h3>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            Define reusable system context prompts (e.g., <span className="italic text-foreground">"Generate Database Migration"</span>) inside your template. Any card using this Standard inherits these prompt shortcuts inside the AI Task console instantly!
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Options Table */}
                      <h3 className="font-bold text-xs text-foreground uppercase mb-2">
                        Supported Property Types (Dropdown Options)
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Choose from 7 visual field types in the dropdown. Each choice maps directly to an interactive, user-friendly editor widget inside the Inspector:
                      </p>
                      
                      <div className="border border-border/10 rounded-sm overflow-hidden bg-background/30 text-xs">
                        <table className="w-full text-left uppercase leading-normal">
                          <thead>
                            <tr className="bg-secondary/[0.04] border-b border-border/15 font-black text-foreground">
                              <th className="p-3 w-1/4">DROPDOWN OPTION TEXT</th>
                              <th className="p-3 w-1/5">INTERNAL YML ID</th>
                              <th className="p-3">WORKSPACE INTERFACE BEHAVIOR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 text-foreground/80">
                            <tr>
                              <td className="p-3 font-bold text-amber-400">Plain Text / JSON</td>
                              <td className="p-3 font-mono">text</td>
                              <td className="p-3 leading-relaxed">Standard single-line text box for normal configuration settings.</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-amber-400">File Path</td>
                              <td className="p-3 font-mono">file_path</td>
                              <td className="p-3 leading-relaxed">Renders a clickable link with a lightning bolt (⚡). Clicking it opens the target file inside your IDE instantly!</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-amber-400">Method List</td>
                              <td className="p-3 font-mono">interface_list</td>
                              <td className="p-3 leading-relaxed">Displays an interactive methods table to map function names, parameter scopes, and return values.</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-amber-400">Database Tables</td>
                              <td className="p-3 font-mono">tables_list</td>
                              <td className="p-3 leading-relaxed">A visual database editor where you can specify columns, data types, keys, and index configurations.</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-amber-400">Code Snippets</td>
                              <td className="p-3 font-mono">code_list</td>
                              <td className="p-3 leading-relaxed">Displays interactive, copyable containers to organize and retrieve isolated snippets of code.</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-amber-400">User Stories</td>
                              <td className="p-3 font-mono">story_list</td>
                              <td className="p-3 leading-relaxed">An interactive checklist of milestones or requirement states that syncs back to your files as booleans.</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-amber-400">Process Flow</td>
                              <td className="p-3 font-mono">flow_list</td>
                              <td className="p-3 leading-relaxed">A numbered sequence timeline to map hook pipelines, controller loops, or hook execution cycles.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section Separator */}
                    <div className="border-t border-border/10 my-4" />

                    {/* PART 2: UNDER-THE-HOOD SCHEMA SPECIFICATION */}
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="text-sky-400 w-5 h-5" />
                          <h2 className="text-sm font-black tracking-wider text-foreground uppercase">
                            PART 02: UNDER-THE-HOOD SCHEMA SPECIFICATION
                          </h2>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Ingestalt stores visual configurations directly inside the note's Markdown frontmatter on your local disk. Below are the visual decorators, pre-wired system types, and physical disk properties parsed by the engine.
                        </p>
                      </div>

                      {/* Hidden Parsing Variables (Position, Relations, configId) */}
                      <div className="border border-border/10 p-5 bg-secondary/[0.01] pl-7 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Plus size={13} className="text-rose-400" />
                          03. Core Internal Parsing Fields (YAML Schema)
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          Ingestalt's file loaders read and preserve these system properties directly inside the frontmatter:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs uppercase font-mono">
                          <div className="border border-border/10 bg-background/40 p-3 rounded-sm">
                            <div className="font-bold text-rose-400 mb-1">configId (or config_id)</div>
                            <p className="text-muted-foreground font-sans leading-relaxed text-xs">Binds normal markdown nodes to custom Standard configurations template definitions.</p>
                          </div>
                          <div className="border border-border/10 bg-background/40 p-3 rounded-sm">
                            <div className="font-bold text-rose-400 mb-1">position (x / y offsets)</div>
                            <p className="text-muted-foreground font-sans leading-relaxed text-xs">Holds board coordinate position variables to lock and persist visual placement on the canvas.</p>
                          </div>
                          <div className="border border-border/10 bg-background/40 p-3 rounded-sm">
                            <div className="font-bold text-rose-400 mb-1">relations (targetId / type)</div>
                            <p className="text-muted-foreground font-sans leading-relaxed text-xs">Stores a list of visual source-to-target connect wires directly inside the card frontmatter list.</p>
                          </div>
                        </div>
                      </div>

                      {/* Visual Coordination Decorators (Icons & Colors) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-7 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sky-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Plus size={13} className="text-sky-400" />
                          01. Visual Icon Options (Lucide Mappings)
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                          Customize node templates by assigning standard Lucide icon names inside your standards blueprint configurations:
                        </p>
                        <div className="grid grid-cols-4 gap-2 font-mono text-xs uppercase leading-none">
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Database size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Database</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Wifi size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Wifi</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Layers size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Layers</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Compass size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Compass</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Cpu size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Cpu</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Bot size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Bot</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <Settings2 size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">Settings</span>
                          </div>
                          <div className="p-2 border border-border/10 bg-background/50 flex flex-col items-center justify-center gap-1.5 text-center rounded-sm">
                            <FileText size={14} className="text-sky-400/80" />
                            <span className="font-bold text-foreground/75">FileText</span>
                          </div>
                        </div>
                      </div>

                      <div className="border border-border/10 p-5 bg-secondary/[0.02] pl-7 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400" />
                        <h4 className="font-black text-xs text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Plus size={13} className="text-emerald-400" />
                          02. Theme Color Palette (Click to Copy)
                        </h4>
                        <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                          Copy hex codes instantly to style visual node borders and matching dynamic input headers:
                        </p>
                        <div className="grid grid-cols-3 gap-2 font-mono text-xs leading-relaxed">
                          {[
                            { name: 'Blue', hex: '#3b82f6' },
                            { name: 'Green', hex: '#22c55e' },
                            { name: 'Purple', hex: '#a855f7' },
                            { name: 'Amber', hex: '#f59e0b' },
                            { name: 'Teal', hex: '#14b8a6' },
                            { name: 'Rose', hex: '#f43f5e' }
                          ].map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => copyColorToClipboard(color.hex)}
                              className="group p-1.5 border border-border/10 bg-background hover:border-emerald-500/40 flex items-center gap-2 rounded-sm transition-all relative overflow-hidden"
                            >
                              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color.hex }} />
                              {copiedColor === color.hex ? (
                                <span className="font-bold text-emerald-500 animate-pulse">COPIED!</span>
                              ) : (
                                <span className="font-bold text-foreground/75 transition-colors group-hover:text-foreground">{color.hex}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Predefined Built-in Schemas Reference */}
                    <div className="border border-border/10 p-5 bg-secondary/[0.01] pl-7 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500" />
                      <h4 className="font-black text-xs text-foreground uppercase tracking-wider mb-2">
                        03. Predefined Core Node Types & Built-In Schemas
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Ingestalt includes 5 predefined visual categories. When you load folders, these base classifications automatically inherit the following schema definitions out-of-the-box:
                      </p>
                      <div className="border border-border/10 rounded-sm overflow-hidden bg-background/30 text-xs">
                        <table className="w-full text-left uppercase leading-normal">
                          <thead>
                            <tr className="bg-secondary/[0.04] border-b border-border/15 font-black text-foreground">
                              <th className="p-2">NODE TYPE ID</th>
                              <th className="p-2">PRE-WIRED FRONTMATTER VARIABLE KEY</th>
                              <th className="p-2">FIELD TYPE</th>
                              <th className="p-2">VISUAL BEHAVIOR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono text-foreground/80">
                            <tr>
                              <td className="p-2 font-bold text-sky-400">database</td>
                              <td className="p-2">tables</td>
                              <td className="p-2">tables_list</td>
                              <td className="p-2 font-sans">Database table schema & index-key console.</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-bold text-emerald-400" rowSpan={2}>api</td>
                              <td className="p-2">methods</td>
                              <td className="p-2">interface_list</td>
                              <td className="p-2 font-sans">Interactive REST API endpoints table with jump-to-code lines.</td>
                            </tr>
                            <tr>
                              <td className="p-2">filepath</td>
                              <td className="p-2">file_path</td>
                              <td className="p-2 font-sans">Active lightning badge link directly targeting source code.</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-bold text-purple-400" rowSpan={2}>frontend</td>
                              <td className="p-2">stories</td>
                              <td className="p-2">story_list</td>
                              <td className="p-2 font-sans">Checklist checkboxes mapping UI/UX requirements.</td>
                            </tr>
                            <tr>
                              <td className="p-2">filepath</td>
                              <td className="p-2">file_path</td>
                              <td className="p-2 font-sans">Active link targeting the corresponding page/component file.</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-bold text-amber-500" rowSpan={2}>hook</td>
                              <td className="p-2">process</td>
                              <td className="p-2">flow_list</td>
                              <td className="p-2 font-sans">Numbered list mapping state changes or custom hooks flow loops.</td>
                            </tr>
                            <tr>
                              <td className="p-2">filepath</td>
                              <td className="p-2">file_path</td>
                              <td className="p-2 font-sans">Active link pointing directly to physical helper or logic code.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* YAML Code Sample Panels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Panel 1: Regular classified note frontmatter */}
                      <div className="border border-border/10 overflow-hidden bg-background/40 relative">
                        <div className="px-4 py-3 bg-secondary/[0.03] border-b border-border/10 text-xs font-black tracking-widest text-foreground/80">
                          EXAMPLE_CLASSIFIED_NOTE.MD
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-foreground/70 select-text font-mono h-[220px] whitespace-pre-wrap bg-secondary/[0.01]">
{`---
title: "User Controller"
type: "api"
filepath: "src/controllers/UserController.ts"
methods:
  - name: "fetchActiveUsers"
    params: "limit: number"
    returns: "Promise<User[]>"
    line: 24
stories:
  - text: "Authenticate using session credentials"
    completed: true
  - text: "Apply pagination constraints to queries"
    completed: false
---`}
                        </pre>
                      </div>

                      {/* Panel 2: Standard blueprint note frontmatter */}
                      <div className="border border-border/10 overflow-hidden bg-background/40 relative">
                        <div className="px-4 py-3 bg-secondary/[0.03] border-b border-border/10 text-xs font-black tracking-widest text-foreground/80">
                          CUSTOM_STANDARD_BLUEPRINT.MD
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-foreground/70 select-text font-mono h-[220px] whitespace-pre-wrap bg-secondary/[0.01]">
{`---
title: "Custom Templates Blueprint"
type: "standards"
definitions:
  - id: "microservice"
    type: "Backend Microservice"
    icon: "Cpu"
    color: "#a855f7"
    fields:
      - name: "endpoints"
        type: "interface_list"
        icon: "Zap"
        color: "#a855f7"
      - name: "filepath"
        type: "file_path"
        icon: "FileText"
        color: "#94a3b8"
---`}
                        </pre>
                      </div>
                      </div>
                    </div>

                    <div className="relative border border-border/10 p-5 bg-secondary/[0.01] pl-7">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                      <h4 className="font-black text-xs text-foreground mb-2">CUSTOM STANDARDS CREATION</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To define a novel schema classification, map a blueprint note as <strong className="text-foreground">type: standards</strong> and outline your bespoke custom fields inside the Node Types Editor. Any note assigned to that Standard inherits the corresponding interface inputs instantly!
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs tracking-widest text-muted-foreground font-black mb-1">CHAPTER_06 // INJECT</div>
                      <h1 className="text-3xl font-black tracking-widest text-foreground/90 uppercase leading-none pb-1">
                        AI TASK CONTEXT ENGINEERING
                      </h1>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mt-3">
                        Ingestalt acts as a spatial, surgical filter for your AI coding assistant. By visually wiring notes together, you compile highly informed context prompts that you can execute directly inside your local IDE.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div className="border border-border/10 p-4 bg-secondary/[0.01]">
                        <div className="text-emerald-500 font-bold text-lg mb-1">01</div>
                        <div className="font-black text-xs text-foreground uppercase mb-1">Map Visually</div>
                        <p className="text-foreground/80 leading-relaxed">
                          Draw visual canvas lines from regular notes (API methods, database tables, user stories) directly to an <strong className="text-foreground">AI Task Node</strong>.
                        </p>
                      </div>
                      <div className="border border-border/10 p-4 bg-secondary/[0.01]">
                        <div className="text-emerald-500 font-bold text-lg mb-1">02</div>
                        <div className="font-black text-xs text-foreground uppercase mb-1">Harvest Context</div>
                        <p className="text-foreground/80 leading-relaxed">
                          Ingestalt dynamically crawls connected nodes, automatically packaging their exact properties, schemas, and prompt templates into the background.
                        </p>
                      </div>
                      <div className="border border-border/10 p-4 bg-secondary/[0.01]">
                        <div className="text-emerald-500 font-bold text-lg mb-1">03</div>
                        <div className="font-black text-xs text-foreground uppercase mb-1">Surgical Selection</div>
                        <p className="text-foreground/80 leading-relaxed">
                          Open the AI Task Node's Properties Workspace. Toggle checkboxes to selectively filter out unwanted metadata and pinpoint exact code context.
                        </p>
                      </div>
                      <div className="border border-border/10 p-4 bg-secondary/[0.01]">
                        <div className="text-emerald-500 font-bold text-lg mb-1">04</div>
                        <div className="font-black text-xs text-foreground uppercase mb-1">IDE Execution</div>
                        <p className="text-foreground/80 leading-relaxed">
                          Copy the compiled grey-matter prompt and paste it into your local workspace chatbot (like <strong className="text-foreground">IBM Bob IDE</strong> or Cursor) to run the task!
                        </p>
                      </div>
                    </div>

                    {/* Spatial Mapping Flow Chart */}
                    <div className="border border-border/10 p-5 bg-background/30 rounded-sm font-mono text-xs text-foreground/80">
                      <div className="text-xs font-bold uppercase mb-3 text-emerald-400">
                        SPATIAL GRAPH CONTEXT COMPILATION PIPELINE
                      </div>
                      <div className="whitespace-pre overflow-x-auto leading-relaxed text-emerald-400/90 select-none">
{` [Database Schemas] ──(reads)──> [API Endpoints] ──(wires)──> [AI Task Node]
                                                                     │
                                                               [COPY PROMPT]
                                                                     │
                                                             (IBM Bob IDE Chat)`}
                      </div>
                    </div>

                    <div className="relative border border-border/10 p-6 bg-secondary/[0.02] pl-8">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <h4 className="font-black text-xs text-foreground uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Scenario: Visual Prompt Scaffolding side-by-side with IBM Bob
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Need an AI agent to build a new API route that queries your database? Rather than writing a complex prompt from scratch, simply draw a wire from your API Node to your Database Node, and connect both to an AI Task Node. Ingestalt automatically aggregates the exact DB columns, API parameters, and file targets into a clean, surgical prompt context. Paste it into your side-by-side <strong className="text-foreground">IBM Bob IDE</strong> window to generate error-free code instantly!
                      </p>
                    </div>

                    {/* Copyable Console prompt (Prompts Library) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-xs font-black tracking-widest text-foreground/70">SYSTEM CONSTITUTION PROMPT LIBRARY</span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      <div className="border border-border/10 overflow-hidden bg-background/40 relative">
                        <div className="flex justify-between items-center px-4 py-3 bg-secondary/[0.03] border-b border-border/10 text-xs font-black tracking-widest">
                          <span>SYSTEM_ARCHITECTURAL_CONSTITUTION.MD</span>
                          <button
                            onClick={() => copyToClipboard(systemConstitution)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-border/15 hover:border-foreground/30 bg-background text-foreground/70 hover:text-foreground transition-all rounded-none"
                          >
                            {copiedPrompt ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-emerald-500 font-bold">COPIED!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>COPY SYSTEM PROMPT</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-muted-foreground/90 select-text font-mono max-h-[300px] whitespace-pre-wrap">
                          {systemConstitution}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="w-full px-6 py-3 border-t border-border/10 bg-secondary/[0.01] flex justify-between items-center text-xs text-muted-foreground shrink-0 select-none">
          <div>INGESTALT ENGINE: SPATIAL_DOCUMENTATION_IDE</div>
          <div className="flex gap-4">
            <span>SHORTCUT: PRESS ESC TO DE-ACTIVATE</span>
            <span className="hidden sm:inline">DEVELOPED BY: DLDMASTERS X IBM</span>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
