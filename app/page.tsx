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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative font-mono uppercase selection:bg-foreground/20 text-xs tracking-wider">
      {/* Stark Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:30px_30px]" />
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
              src="/ingestalt/Logo.png" 
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
                <span className="block text-foreground/90">"I HAVE NO IDEA</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60 pb-1">
                  WHAT THIS CODE DOES."
                </span>
                <span className="block text-foreground/45 text-[10px] md:text-xs tracking-widest font-black mt-2 mb-4">
                  — YOU, YESTERDAY.
                </span>
                <span className="block text-foreground/95 text-3xl md:text-5xl lg:text-6xl mt-4">
                  VISUALIZE THE GESTALT.
                </span>
              </motion.h1>

              {/* Stark Subtitle Tagline */}
              <motion.p 
                variants={itemVariants}
                className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed tracking-wider uppercase font-medium animate-pulse"
              >
                THE PROBLEM IS, WE ARE BUILDING SYSTEMS FASTER THAN WE CAN COMPREHEND THEM. 
                INGESTALT IS A LOCAL-FIRST SPATIAL WORKSPACE BUILT TO UNTANGLE THE MASSIVE CODEBASES WE DON'T ACTUALLY UNDERSTAND.
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

                  {/* Step 3: Bidirectional Loop */}
                  <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                    <div className="flex flex-col space-y-4">
                      <div className="w-10 h-10 border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-muted-foreground shrink-0 rounded-none">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="text-[10px] tracking-widest text-muted-foreground font-black">STEP_03 // PERSISTENCE</div>
                      <h3 className="text-xs font-black tracking-widest text-foreground">BIDIRECTIONAL LOOP</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        OPT-IN TO LIVE PUSH WRITING TO DISK AND AUTOMATE INDEXING WITH ACTIVE HEARTBEAT PULLS.
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-mono px-3 py-1 bg-secondary/[0.04] border border-border/10 rounded-none text-muted-foreground">
                          LIVE_PUSH_&_HEARTBEAT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local-First Secure Banner */}
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
                    ALL GRAPH DATA AND ASSETS RESIDE PERMANENTLY ON YOUR MACHINE. NO EXTERNAL CLOUD DATABASES.
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Editorial Manifesto Quote */}
            <motion.div 
              variants={itemVariants}
              className="border border-border/10 bg-secondary/[0.02] p-8 md:p-12 text-center rounded-none relative overflow-hidden my-6"
            >
              <div className="text-[10px] tracking-widest text-muted-foreground mb-4">SYSTEM_STATEMENT // GESTALT_CONSTITUTION</div>
              <h2 className="text-xl md:text-2xl font-black leading-relaxed tracking-widest uppercase text-foreground/90">
                "SEEING SOMETHING AS A WHOLE RATHER THAN THE SUM OF ITS PARTS — THAT'S WHAT INGESTALT IS ALL ABOUT. ONE NODE CONNECTING TO TWO OTHERS — IT'S THE PRODUCT'S CORE IDEA DRAWN TO THE SIMPLEST."
              </h2>
            </motion.div>

            {/* Modern Development Chronicles */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6"
            >
              {/* The AI Hook Card */}
              <div className="border border-border/10 bg-secondary/[0.02] p-6 md:p-8 text-left rounded-none relative overflow-hidden pl-10 flex flex-col gap-3">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <div className="text-[10px] tracking-widest text-amber-500 font-black">THE_HOOK // AN_ALL_TOO_FAMILIAR_STORY</div>
                <h3 className="text-sm font-black leading-normal tracking-widest uppercase">
                  "YOU HAVE AN IDEA, AND YOU WANT TO BUILD AN APP. BEFORE 2023, YOU WOULD HAVE NEEDED TO STUDY THE ARCHITECTURE. NOW? WE JUST BLAST IT WITH AI UNTIL IT COMPILES."
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                  THE CONGENITAL DEBT OF HIGH-SPEED CODE GENERATION IS THAT WE ARE BUILDING SYSTEMS FASTER THAN WE CAN COMPREHEND THEM. INGESTALT IS THE REVEAL. IT MAPS THE SCATTERED ARCHITECTURE SO YOU ACTUALLY UNDERSTAND THE CODEBASE.
                </p>
              </div>

              {/* IBM Bob Cooperation Card */}
              <div className="border border-border/10 bg-secondary/[0.02] p-6 md:p-8 text-left rounded-none relative overflow-hidden pl-10 flex flex-col gap-3">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                <div className="text-[10px] tracking-widest text-purple-400 font-black">THE_HUMBLEBRAG // IBM_BOB_COOPERATION</div>
                <h3 className="text-sm font-black leading-normal tracking-widest uppercase flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-400 shrink-0 animate-bounce" />
                  "BOB WRITES THE TERRITORY; INGESTALT DRAWS THE MAP."
                </h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                  HONESTLY? WE EXHAUSTED OUR BOB TOKEN QUOTA JUST TRYING TO KEEP UP. BOB IS AN EXCEPTIONAL CODING PARTNER, BUT ITS REAL POWER UNLOCKS WITH INGESTALT. BECAUSE INGESTALT READS DIRECTLY FROM YOUR LOCAL FILES, WHATEVER BOB EDITS IN YOUR IDE INSTANTLY SYNCS TO THE VISUAL MAP HERE ON THE CANVAS.
                </p>
              </div>
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
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">THE UNEMPLOYED STARTUP BUILDER</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    BLASTING CODE OUT AT 100MPH WITH AI ASSISTANTS? USE INGESTALT AS YOUR SPATIAL COMMAND CENTER TO PREVENT YOUR CODEBASE FROM COLLAPSING INTO A BLACK HOLE OF TECHNICAL DEBT BEFORE YOU EVEN LAUNCH.
                  </p>
                </div>

                {/* Use Case 2 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">THE EMPLOYED LEGACY UNTANGLE-ER</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    INHERITED A SPRAWLING, UNDOCUMENTED LEGACY MONSTER? MAP YOUR LOCAL FILES ONTO THE INFINITE CANVAS, TRACE RELATIONSHIP HANDLES, AND FINALLY UNDERSTAND HOW THE SYSTEM IS PUT TOGETHER.
                  </p>
                </div>

                {/* Use Case 3 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">THE GRAPH LOVER (SPATIAL WIKI)</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    HONESTLY? SOME OF US JUST LIKE GRAPHS. CONVERT YOUR FLAT, BORING MARKDOWN FILES INTO A GORGEOUS, FULLY INTERACTIVE SPATIAL KNOWLEDGE WEB THAT IS ACTUALLY FUN TO BROWSE.
                  </p>
                </div>

                {/* Use Case 4 */}
                <div className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.01] pl-8 group hover:bg-secondary/[0.03] transition-all">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
                  <div className="w-10 h-10 rounded-none border border-border/10 bg-secondary/[0.03] flex items-center justify-center text-foreground/60 mb-6 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black tracking-widest mb-3 uppercase text-foreground">AI TASK CONTEXT ENGINEERING</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                    STOP DUMPING MASSIVE, IRRELEVANT FILE CONTEXT INTO LLMS. SURGICALLY WIRE ONLY THE NECESSARY DEPENDENCIES, SCHEMAS, AND MARKDOWN SPECS TO COMPILE PERFECT AI TASKS.
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
                      <h3 className="text-xs font-black tracking-widest mb-2 uppercase text-foreground">PORTABLE ATLAS SPECIFICATION</h3>
                      <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                        EXPORT AND SHARE ENTIRE VISUAL SYSTEMS ARCHITECTURES. BUNDLE MAP COORDINATES AND CONNECTIONS INTO PORTABLE, ZERO-DEPENDENCY ATLAS JSON CONFIGURATIONS TO SHARE WITH TEAMMATES INSTANTLY.
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
