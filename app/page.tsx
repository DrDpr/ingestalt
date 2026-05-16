'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText, Sparkles, GitBranch, Layers, Zap, Users, Bot, ShieldCheck, Component, Network, Info, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Page() {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] as any
      } 
    }
  };

  return (
    <div className="min-h-screen bg-background relative text-foreground font-mono uppercase selection:bg-foreground/20 text-xs tracking-wider">
      {/* Stark Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto border-x border-border/10 bg-background/50 backdrop-blur-sm">
        
        {/* Navigation Bar */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full px-6 py-6 flex justify-between items-center border-b border-border/10"
        >
          <div className="flex items-center gap-3">
            <Image 
              src="/Logo.png" 
              alt="Ingestalt Logo" 
              width={20} 
              height={20} 
              className="object-contain opacity-50" 
            />
            <span className="font-black tracking-widest text-xs">INGESTALT</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about">
              <Button 
                variant="ghost" 
                className="font-mono uppercase tracking-widest text-[10px] rounded-none border border-border/5 hover:border-border/20 px-4 py-2 h-auto transition-colors"
              >
                ABOUT
              </Button>
            </Link>
            <Link href="/canvas">
              <Button 
                className="font-mono uppercase tracking-widest text-[10px] rounded-none bg-foreground text-background hover:bg-foreground/90 px-4 py-2 h-auto transition-all shadow-none flex items-center gap-2 group"
              >
                OPEN CANVAS
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="w-full px-6 md:px-12 py-16 md:py-24 flex-1 flex flex-col justify-center">
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="space-y-16"
          >
            {/* Hero Main Content */}
            <div className="space-y-6">
              
              {/* Hackathon Badge */}
              <motion.div 
                variants={itemVariants} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-secondary/[0.04] border border-border/10 text-[10px] font-bold tracking-widest text-muted-foreground mb-4"
              >
                <Sparkles className="w-3.5 h-3.5" />
                BUILT_FOR_THE_IBM_BOB_HACKATHON
              </motion.div>

              {/* Stark Monospaced Title */}
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-widest leading-none uppercase"
              >
                <span className="block text-foreground/90">MAKE THE</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60 pb-1">
                  HIDDEN STRUCTURE
                </span>
                <span className="block text-foreground/90">VISIBLE.</span>
              </motion.h1>

              {/* Stark Subtitle Tagline */}
              <motion.p 
                variants={itemVariants}
                className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed tracking-wider uppercase font-medium"
              >
                A LOCAL-FIRST SPATIAL DOCUMENTATION ENGINE FOR SOFTWARE ARCHITECTURE. 
                SEE THE WHOLE SYSTEM, NOT JUST THE SCATTERED FRAGMENTS.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/canvas">
                  <Button 
                    className="group rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-5 h-auto text-xs font-bold tracking-widest transition-all flex items-center gap-2"
                  >
                    GET STARTED
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/about">
                  <Button 
                    variant="outline"
                    className="rounded-none border border-border/10 hover:border-foreground/30 bg-secondary/[0.02] hover:bg-secondary/[0.08] px-8 py-5 h-auto text-xs font-bold tracking-widest transition-all"
                  >
                    LEARN MORE
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Stark Connected Ecosystem Diagram */}
            <motion.div variants={itemVariants} className="pt-8">
              <div className="relative">
                {/* 3-Step Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  
                  {/* Step 1: Files */}
                  <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                    <div className="flex flex-col space-y-4">
                      <div className="w-10 h-10 border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-muted-foreground shrink-0 rounded-none">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-[10px] tracking-widest text-muted-foreground font-black">STEP_01 // SOURCE_DATA</div>
                      <h3 className="text-xs font-black tracking-widest text-foreground">YOUR FILES</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        START WITH YOUR EXISTING MARKDOWN DOCUMENTATION DIRECTLY FROM DISK.
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-mono px-3 py-1 bg-secondary/[0.04] border border-border/10 rounded-none text-muted-foreground">
                          *.MD_FILES
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Spatial Canvas */}
                  <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                    <div className="flex flex-col space-y-4">
                      <div className="w-10 h-10 border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-muted-foreground shrink-0 rounded-none">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="text-[10px] tracking-widest text-muted-foreground font-black">STEP_02 // VISUALIZATION</div>
                      <h3 className="text-xs font-black tracking-widest text-foreground">SPATIAL CANVAS</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        NODES ON AN INFINITE INTERACTIVE CANVAS WITH DRAWABLE RELATIONSHIPS.
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-mono px-3 py-1 bg-secondary/[0.04] border border-border/10 rounded-none text-muted-foreground">
                          SPATIAL_IDE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Live Sync */}
                  <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                    <div className="flex flex-col space-y-4">
                      <div className="w-10 h-10 border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-muted-foreground shrink-0 rounded-none">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="text-[10px] tracking-widest text-muted-foreground font-black">STEP_03 // PERSISTENCE</div>
                      <h3 className="text-xs font-black tracking-widest text-foreground">LIVE SYNC</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        EDITS SYNC BACK AUTOMATICALLY TO LOCAL MARKDOWN FILES INSTANTLY.
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-mono px-3 py-1 bg-secondary/[0.04] border border-border/10 rounded-none text-muted-foreground">
                          AUTO_PERSIST
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local-First Banner */}
                <motion.div 
                  variants={itemVariants}
                  className="mt-8 border border-border/10 bg-secondary/[0.01] p-6 rounded-none relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="font-black text-[10px] tracking-widest text-foreground">LOCAL-FIRST // WORKSPACE_SECURE</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                    ALL GRAPH DATA AND ASSETS RESIDE PERMANENTLY ON YOUR MACHINE. NO EXTERNAL DATABASES.
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Editorial Manifesto Quote */}
            <motion.div 
              variants={itemVariants}
              className="border border-border/10 bg-secondary/[0.02] p-8 md:p-12 text-center rounded-none relative overflow-hidden my-12"
            >
              <div className="text-[10px] tracking-widest text-muted-foreground mb-4">SYSTEM_STATEMENT</div>
              <h2 className="text-xl md:text-2xl font-black leading-relaxed tracking-widest uppercase">
                "SEEING SOMETHING AS A WHOLE RATHER THAN THE SUM OF ITS PARTS — THAT'S WHAT INGESTALT IS ALL ABOUT. ONE NODE CONNECTING TO TWO OTHERS — IT'S THE PRODUCT'S CORE IDEA DRAWN TO THE SIMPLEST."
              </h2>
            </motion.div>
            
            {/* Stark Use Cases Section */}
            <motion.div variants={itemVariants} className="pt-8">
              <div className="text-center mb-12">
                <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase mb-4">WHO IS THIS FOR?</h2>
                <p className="text-muted-foreground text-xs max-w-xl mx-auto uppercase leading-relaxed font-semibold">
                  INGESTALT BRIDGES THE GAP BETWEEN HOW DOCUMENTATION IS WRITTEN AND HOW COMPLEX ARCHITECTURES ARE VISUALLY COMPREHENDED.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Use Case 1 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">DEVELOPER ONBOARDING</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    STOP HANDING NEW TEAMMATES FLAT MARKDOWN FOLDERS. PROVIDE A SPATIAL ARCHITECTURAL MAP WHERE THEY CAN VISUALLY TRACE SYSTEM COMPONENTS.
                  </p>
                </div>

                {/* Use Case 2 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">AI CONTEXT MAPPING</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    AI AGENTS STRUGGLE WITH FLAT FRAGMENTED CONTEXT. BY STRUCTURING WORKSPACES SPATIALLY, YOU GIVE AI PARTNERS AN EXPLICIT SYSTEM TOPOLOGY.
                  </p>
                </div>

                {/* Use Case 3 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">ARCHITECTURE PLANNING</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    PROPOSE CHANGES OR MAP MICROSERVICES DIRECTLY ON AN ACTIVE CANVAS. SPOT STRUCTURAL BOTTLENECKS BEFORE WRITING A SINGLE LINE OF CODE.
                  </p>
                </div>

                {/* Use Case 4 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">SYSTEM AUDITING</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    BECAUSE IT RUNS DIRECTLY FROM LOCAL FILES, VISUALIZE WHICH COMPONENT DIRECTORIES ARE UNDOCUMENTED, ORPHANED, OR DISCONNECTED.
                  </p>
                </div>

                {/* Use Case 5 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 md:col-span-2 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 shrink-0">
                      <Component className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-widest mb-2 uppercase text-foreground">ISOLATE CRITICAL COMPONENTS</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                        FILTER COMPLEXITY INSTANTLY. ISOLATE A SINGLE MODULE AND VISUALIZE ONLY ITS IMMEDIATE UPSTREAM DEPENDENTS AND DOWNSTREAM API EFFECTS.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

          </motion.div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 border-t border-border/10 mt-12 bg-secondary/[0.01]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
            <p>© 2026 INGESTALT // BY DLDMASTERS. PARTNERED WITH IBM BOB.</p>
            <div className="flex gap-6">
              <span className="text-muted-foreground">ENGINE: SPATIAL_IDE</span>
              <span className="text-muted-foreground">HOST: LOCALHOST</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
