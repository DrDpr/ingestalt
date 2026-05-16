'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Network, FileText, Sparkles, GitBranch, Layers, Zap, Clock } from 'lucide-react';
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
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto px-6 py-12 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <Image src="/Logo.png" alt="Ingestalt Logo" width={32} height={32} className="object-contain" />
            <span className="font-bold tracking-tight text-xl">Ingestalt</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                About
              </Button>
            </Link>
            <Link href="/canvas">
              <Button className="group">
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
            className="space-y-20"
          >
            {/* Hero Content */}
            <div className="text-center space-y-8">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Built for the IBM Bob Hackathon
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
              >
                <span className="block">Make the</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  hidden structure
                </span>
                <span className="block">visible</span>
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
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                <Link href="/canvas">
                  <Button 
                    size="lg" 
                    className="group px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/about">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-6 text-lg font-medium border-2 hover:bg-secondary/50 transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Connected Ecosystem Flow */}
            <motion.div variants={itemVariants} className="relative pt-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl" />
              
              <div className="relative">
                {/* Connection Flow Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  {/* Connecting Lines (Desktop) */}
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 -translate-y-1/2" />
                  
                  {/* Step 1: Files */}
                  <motion.div
                    variants={itemVariants}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border hover:border-blue-500/50 transition-all duration-300 h-full">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Your Files</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Start with your existing markdown documentation
                        </p>
                        <div className="pt-2">
                          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            *.md files
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2: Transform */}
                  <motion.div
                    variants={itemVariants}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border hover:border-purple-500/50 transition-all duration-300 h-full">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 rounded-xl bg-purple-500/10 text-purple-500">
                          <Layers className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Spatial Canvas</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Nodes on an infinite canvas with drawable relationships
                        </p>
                        <div className="pt-2">
                          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Interactive
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3: Sync */}
                  <motion.div
                    variants={itemVariants}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border hover:border-pink-500/50 transition-all duration-300 h-full">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 rounded-xl bg-pink-500/10 text-pink-500">
                          <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Live Sync</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Changes sync back automatically — always up to date
                        </p>
                        <div className="pt-2">
                          <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
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
                  className="mt-12 flex justify-center"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-xl border border-border">
                    <Network className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Local-First</span>
                    <span className="text-sm text-muted-foreground">Everything stays on your machine</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Branding Section */}
            <motion.div variants={itemVariants} className="relative mt-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-10" />
              <div className="relative p-10 md:p-16 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/50">
                <div className="max-w-3xl mx-auto space-y-8">
                  <p className="text-2xl md:text-3xl font-bold leading-relaxed text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                      Seeing something as a whole rather than the sum of its parts
                    </span>
                    <span className="text-muted-foreground"> — that's what Ingestalt is all about.</span>
                  </p>
                  
                  <div className="h-px w-full bg-border/50" />
                  
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
                    Ingestalt makes the hidden structure of a project visible for the people building it. 
                    One node connecting to two others — it's the product's core idea drawn to the simplest.
                  </p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-full max-w-6xl mx-auto px-6 py-12 border-t border-border/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Ingestalt by DLDMasters. Built with IBM Bob.</p>
            <div className="flex gap-6">
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
    </div>
  );
}

// Made with Bob
