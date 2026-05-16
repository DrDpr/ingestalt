'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Network, FileText, Sparkles, GitBranch, Layers, Zap, Users, Bot, ShieldCheck, Component } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Page() {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as any
      } 
    }
  };

  return (
    <div className="min-h-screen bg-background relative text-foreground font-sans selection:bg-blue-500/30">
      {/* Animated Premium Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 150, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/40 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -150, 0],
            y: [0, 150, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/40 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-emerald-500/30 blur-[100px]" 
        />
        
        {/* Animated Grid Overlay */}
        <motion.div 
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:40px_40px]" 
        />
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto px-6 py-12 flex justify-between items-center"
        >
          <div className="flex items-center gap-3 bg-secondary/20 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-xl shadow-xl">
            <Image src="/Logo.png" alt="Ingestalt Logo" width={28} height={28} className="object-contain" />
            <span className="font-bold tracking-tight text-lg">Ingestalt</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full px-6">
                About
              </Button>
            </Link>
            <Link href="/canvas">
              <Button className="group rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all shadow-xl shadow-foreground/10 px-6">
                Open Canvas
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="w-full max-w-6xl mx-auto px-6 flex-1 flex flex-col justify-center pb-32">
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="space-y-24"
          >
            {/* Hero Content */}
            <div className="text-center space-y-8 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
              
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-bold tracking-widest uppercase mb-6 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                Built for the IBM Bob Hackathon
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[1.05]"
              >
                <span className="block text-foreground/90">Make the</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 pb-2">
                  hidden structure
                </span>
                <span className="block text-foreground/90">visible</span>
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium"
              >
                A local-first spatial documentation engine for the people building your project. 
                See the whole, not just the parts.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
              >
                <Link href="/canvas">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden rounded-full px-10 py-7 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    Get Started
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                  </Button>
                </Link>
                
                <Link href="/about">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-full px-10 py-7 text-lg font-bold border-white/10 bg-secondary/20 backdrop-blur-md hover:bg-secondary/40 hover:border-white/20 transition-all duration-300 shadow-xl"
                  >
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Connected Ecosystem Flow */}
            <motion.div variants={itemVariants} className="relative pt-24">
              <div className="relative">
                {/* Connection Flow Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Connecting Lines (Desktop) */}
                  <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/40 to-pink-500/20 -translate-y-1/2" />
                  
                  {/* Step 1: Files */}
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-10 rounded-3xl bg-card/40 backdrop-blur-2xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-500 h-full shadow-2xl shadow-black/20">
                      <div className="flex flex-col items-center text-center space-y-6">
                        <div className="p-5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Your Files</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Start with your existing markdown documentation
                        </p>
                        <div className="pt-4">
                          <div className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-full bg-black/20 border border-white/5 text-muted-foreground shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                            *.md files
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2: Transform */}
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-10 rounded-3xl bg-card/40 backdrop-blur-2xl border border-white/5 group-hover:border-purple-500/30 transition-all duration-500 h-full shadow-2xl shadow-black/20">
                      <div className="flex flex-col items-center text-center space-y-6">
                        <div className="p-5 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Layers className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Spatial Canvas</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Nodes on an infinite canvas with drawable relationships
                        </p>
                        <div className="pt-4">
                          <div className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-full bg-black/20 border border-white/5 text-muted-foreground shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                            Interactive
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3: Sync */}
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-10 rounded-3xl bg-card/40 backdrop-blur-2xl border border-white/5 group-hover:border-pink-500/30 transition-all duration-500 h-full shadow-2xl shadow-black/20">
                      <div className="flex flex-col items-center text-center space-y-6">
                        <div className="p-5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Live Sync</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Changes sync back automatically — always up to date
                        </p>
                        <div className="pt-4">
                          <div className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-full bg-black/20 border border-white/5 text-muted-foreground shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                            Real-time
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Local-First Badge */}
                <motion.div 
                  variants={itemVariants}
                  className="mt-16 flex justify-center"
                >
                  <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-card/50 backdrop-blur-2xl border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Network className="w-6 h-6 text-blue-400 relative z-10" />
                    <span className="font-bold text-lg relative z-10">Local-First</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 relative z-10" />
                    <span className="text-muted-foreground font-medium relative z-10">Everything stays on your machine</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Branding Section */}
            <motion.div variants={itemVariants} className="relative mt-32">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[3rem] blur-3xl opacity-10" />
              <div className="relative px-12 py-24 md:p-24 rounded-[3rem] bg-secondary/10 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="max-w-4xl mx-auto space-y-12 relative z-10 text-center">
                  <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-foreground/50">
                      Seeing something as a whole rather than the sum of its parts
                    </span>
                    <span className="text-muted-foreground/50 block mt-2 text-2xl md:text-3xl font-medium"> — that's what Ingestalt is all about.</span>
                  </h2>
                  
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
                  
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
                    Ingestalt makes the hidden structure of a project visible for the people building it. 
                    One node connecting to two others — it's the product's core idea drawn to the simplest.
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Use Cases Section */}
            <motion.div variants={itemVariants} className="pt-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Who is this for?</h2>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                  Ingestalt bridges the gap between how documentation is written and how complex systems are actually understood.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Use Case 1 */}
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="group p-10 rounded-[2rem] bg-secondary/10 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">Developer Onboarding</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Stop handing new hires a folder of 100 flat markdown files. Give them a navigable map of the codebase where they can visually trace how the database connects to the API and frontend components.
                  </p>
                </motion.div>

                {/* Use Case 2 */}
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="group p-10 rounded-[2rem] bg-secondary/10 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">AI Context Mapping</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    AI coding assistants struggle with scattered context. By structuring your documentation as a spatial graph with defined relationships, you give AI agents a much clearer picture of your architecture.
                  </p>
                </motion.div>

                {/* Use Case 3 */}
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="group p-10 rounded-[2rem] bg-secondary/10 backdrop-blur-xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <GitBranch className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">Architecture Planning</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Planning a refactor or a new microservice? Visually map out the proposed changes alongside your existing infrastructure to instantly spot missing dependencies or potential bottlenecks.
                  </p>
                </motion.div>

                {/* Use Case 4 */}
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="group p-10 rounded-[2rem] bg-secondary/10 backdrop-blur-xl border border-white/5 hover:border-pink-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">System Auditing</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Because Ingestalt syncs directly with your local files, you can quickly visualize what parts of your system are undocumented, orphaned, or completely disconnected from the main architecture.
                  </p>
                </motion.div>

                {/* Use Case 5 */}
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="group p-10 rounded-[2rem] bg-secondary/10 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 md:col-span-2 lg:col-span-2">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Component className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">Isolate Specific Components</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        When systems grow too complex, use Ingestalt to focus on a single component. Instantly filter out the noise and visualize only the immediate upstream dependencies and downstream effects of the specific area you're actively working on.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-full max-w-6xl mx-auto px-6 py-12 border-t border-white/5 mt-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground font-medium">
            <p className="tracking-wide">© 2026 Ingestalt by DLDMasters. Built with IBM Bob.</p>
            <div className="flex gap-8">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/canvas" className="hover:text-foreground transition-colors">
                Canvas
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
      
      {/* Tailwind arbitrary custom animation definitions required for button glow */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}

// Made with Bob
