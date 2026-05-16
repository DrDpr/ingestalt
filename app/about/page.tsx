'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, CalendarDays, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-background relative text-foreground font-sans selection:bg-blue-500/30">
      {/* Full Screen Grid Background */}
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
          className="w-full max-w-3xl mx-auto px-6 py-12 flex justify-between items-center"
        >
          <Link href="/canvas" className="group">
            <Button variant="ghost" className="text-muted-foreground group-hover:text-foreground pl-2">
              <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Workspace
            </Button>
          </Link>
          <div className="flex items-center gap-3 opacity-100">
            <Image src="/Logo.png" alt="Ingestalt Logo" width={24} height={24} className="object-contain" />
            <span className="font-semibold tracking-tight text-lg">Ingestalt</span>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="w-full max-w-3xl mx-auto px-6 pb-32">

          <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Header */}
            <motion.header variants={itemVariants} className="mt-8 mb-20">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 leading-tight">
                About Ingestalt
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
                A local-first spatial documentation engine for software architecture.
              </p>
            </motion.header>

            {/* Prose Body */}
            <article className="prose prose-lg dark:prose-invert prose-p:text-foreground/70 prose-p:leading-loose prose-a:text-blue-500 max-w-none">
              <motion.p variants={itemVariants}>
                Most teams have a decent understanding of their own codebase. The problem is that understanding lives in people's heads, not anywhere a new teammate or an AI agent can actually access.
              </motion.p>

              <motion.p variants={itemVariants}>
                Documentation exists, but it's flat, scattered, and usually out of date. Nobody reads it, and nobody updates it unless needed. And when you bring an AI into your workflow, it's working from the same disconnected fragments everyone else is ignoring.
              </motion.p>

              <motion.div variants={itemVariants} className="my-14 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative p-8 rounded-2xl bg-secondary/40 backdrop-blur-xl border border-white/10 dark:border-white/5 flex items-start gap-6 shadow-2xl">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center border border-blue-500/30">
                    <Bot className="text-blue-500" size={24} />
                  </div>
                  <p className="text-2xl font-medium m-0 text-foreground leading-snug">
                    That's why with the help of <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">IBM Bob</strong>, we built Ingestalt.
                  </p>
                </div>
              </motion.div>

              <motion.p variants={itemVariants}>
                Ingestalt is a spatial graph documentation engine that transforms your existing markdown files into a navigable interactive spatial canvas.
              </motion.p>

              <motion.p variants={itemVariants}>
                You point it at a YAML markdown, and your documentation becomes nodes on an infinite canvas, with relationships you can draw between them, schemas that define what each node type means, and an editor for keeping content current and updated.
              </motion.p>

              <motion.p variants={itemVariants}>
                The map isn't separate from your repo, so edits sync back to the markdown files automatically, thus it stays alive rather than becoming another process to focus more energy on.
              </motion.p>

              <motion.p variants={itemVariants}>
                The way Ingestalt handles different types of information is flexible by design. Instead of the tool deciding what database looks like, you define it yourself!
              </motion.p>

              <motion.p variants={itemVariants}>
                Inside the tool, each definition lives in your workspace alongside everything else. This means your project's structure reflects how your team actually thinks about it, not the tool that thinks you should organize things. And because everything syncs back to your files, anyone new coming to the codebase has somewhere real to start!
              </motion.p>
            </article>

            {/* Footer / Origin */}
            <motion.div variants={itemVariants} className="mt-32 relative">
              <div className="absolute inset-0 bg-secondary/5 rounded-3xl blur-2xl -z-10" />
              <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-10 border border-border/50 shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-muted-foreground mb-6">
                  <CalendarDays size={16} />
                  The Project
                </div>

                <div className="space-y-6 relative z-10">
                  <p className="text-foreground/80 leading-relaxed text-lg">
                    Our team, <strong className="text-foreground font-black">DLDMasters</strong>, built Ingestalt in 48 hours at the IBM Bob Hackathon from May 15 to 17, 2026, with IBM Bob as our development partner for the project.
                  </p>

                  <div className="h-px w-full bg-border/50 my-8" />

                  <p className="text-foreground/90 leading-relaxed text-2xl font-medium tracking-tight">
                    The question we kept coming back to was simple: <em className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 not-italic">Do developers and AI both do better work when they actually see the full picture of a system?</em>
                  </p>

                  <p className="text-foreground/80 leading-relaxed font-bold mb-12">
                    We believe it does, and Ingestalt is our answer to that!
                  </p>
                </div>

                {/* Team Profiles */}
                <div className="pt-8 border-t border-border/50 relative z-10">
                  <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-6">The Team</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a href="https://github.com/DrDpr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-white/20 transition-all shadow-lg group">
                      <div className="w-12 h-12 rounded-full bg-background overflow-hidden border-2 border-background shadow-inner">
                        <img src="https://github.com/DrDpr.png" alt="DrDpr" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">DrDpr</span>
                    </a>

                    <a href="https://github.com/julius-salinas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-white/20 transition-all shadow-lg group">
                      <div className="w-12 h-12 rounded-full bg-background overflow-hidden border-2 border-background shadow-inner">
                        <img src="https://github.com/julius-salinas.png" alt="julius-salinas" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">julius-salinas</span>
                    </a>

                    <a href="https://github.com/Zadkiel-O" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-white/20 transition-all shadow-lg group">
                      <div className="w-12 h-12 rounded-full bg-background overflow-hidden border-2 border-background shadow-inner">
                        <img src="https://github.com/Zadkiel-O.png" alt="Zadkiel-O" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">Zadkiel-O</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
