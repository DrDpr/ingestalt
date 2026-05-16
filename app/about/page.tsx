'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Bot, Terminal, Info, GitBranch, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-background relative text-foreground font-mono uppercase selection:bg-foreground/20 text-xs tracking-wider">
      {/* Stark Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto border-x border-border/10 bg-background/50 backdrop-blur-sm">
        
        {/* Navigation / Header */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full px-6 py-6 flex justify-between items-center border-b border-border/10"
        >
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground font-mono uppercase tracking-widest text-xs rounded-none border border-border/5 hover:border-border/20 px-3 py-1.5 h-auto transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 w-3.5 h-3.5" />
            BACK
          </Button>
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
        </motion.nav>

        {/* Main Content Grid */}
        <main className="flex-1 p-6 md:p-12">
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="grid grid-cols-12 gap-8"
          >
            {/* Left Column: Metadata Manifesto */}
            <motion.div 
              variants={itemVariants}
              className="col-span-12 md:col-span-4 space-y-6"
            >
              <div className="border border-border/10 p-6 rounded-none bg-secondary/[0.01]">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground pb-2 border-b border-border/10">
                  <Info size={14} />
                  <span className="font-bold text-xs tracking-widest">SYSTEM_MANIFEST</span>
                </div>
                <div className="space-y-4 text-xs tracking-widest">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PROJECT:</span>
                    <span className="font-bold text-foreground">INGESTALT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VERSION:</span>
                    <span className="font-bold text-foreground">1.0.0_BETA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TYPE:</span>
                    <span className="font-bold text-foreground">SPATIAL_IDE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ARCHITECTURE:</span>
                    <span className="font-bold text-foreground">LOCAL_FIRST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI_PARTNER:</span>
                    <span className="font-bold text-foreground">IBM_BOB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HACKATHON:</span>
                    <span className="font-bold text-foreground">IBM_BOB_2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">STATUS:</span>
                    <span className="font-bold text-emerald-500">STABLE</span>
                  </div>
                </div>
              </div>

              {/* Ingestalt Philosophy Callout */}
              <div className="border border-border/10 p-6 rounded-none bg-secondary/[0.01]">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground pb-2 border-b border-border/10">
                  <Terminal size={14} />
                  <span className="font-bold text-xs tracking-widest">PHILOSOPHY</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground tracking-widest uppercase">
                  "SEEING SOMETHING AS A WHOLE RATHER THAN THE SUM OF ITS PARTS — THAT'S WHAT INGESTALT IS ALL ABOUT. ONE NODE CONNECTING TO TWO OTHERS — IT'S THE PRODUCT'S CORE IDEA DRAWN TO THE SIMPLEST."
                </p>
              </div>
            </motion.div>

            {/* Right Column: Narrative Prose & Spatial Architecture Details */}
            <motion.div 
              className="col-span-12 md:col-span-8 space-y-8"
            >
              {/* Stark Headline Header */}
              <motion.header variants={itemVariants} className="pb-6 border-b border-border/10">
                <h1 className="text-3xl md:text-4xl font-black tracking-widest leading-none mb-3">
                  ABOUT INGESTALT
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed tracking-widest font-semibold">
                  A LOCAL-FIRST SPATIAL DOCUMENTATION ENGINE FOR SOFTWARE ARCHITECTURE.
                </p>
              </motion.header>

              {/* Prose Content */}
              <div className="space-y-6 text-foreground/80 leading-relaxed text-xs md:text-sm tracking-wider">
                <motion.p variants={itemVariants}>
                  MOST TEAMS HAVE A DECENT UNDERSTANDING OF THEIR OWN CODEBASE. THE PROBLEM IS THAT UNDERSTANDING LIVES IN PEOPLE'S HEADS, NOT ANYWHERE A NEW TEAMMATE OR AN AI AGENT CAN ACTUALLY ACCESS.
                </motion.p>

                <motion.p variants={itemVariants}>
                  DOCUMENTATION EXISTS, BUT IT'S FLAT, SCATTERED, AND USUALLY OUT OF DATE. NOBODY READS IT, AND NOBODY UPDATES IT UNLESS NEEDED. AND WHEN YOU BRING AN AI INTO YOUR WORKFLOW, IT'S WORKING FROM THE SAME DISCONNECTED FRAGMENTS EVERYONE ELSE IS IGNORING.
                </motion.p>

                {/* IBM Bob Callout Block */}
                <motion.div variants={itemVariants} className="relative border border-border/10 p-6 rounded-none bg-secondary/[0.03] pl-8">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-none bg-blue-500/10 items-center justify-center border border-blue-500/20 flex">
                      <Bot className="text-blue-500" size={16} />
                    </div>
                    <div>
                      <span className="block text-xs tracking-widest text-muted-foreground mb-1">DEVELOPMENT_ORIGIN</span>
                      <p className="text-xs font-bold leading-normal m-0 text-foreground tracking-widest">
                        THAT'S WHY WITH THE HELP OF <strong className="text-blue-400 font-extrabold">IBM BOB</strong>, WE BUILT INGESTALT.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.p variants={itemVariants}>
                  INGESTALT IS A SPATIAL GRAPH DOCUMENTATION ENGINE THAT TRANSFORMS YOUR EXISTING MARKDOWN FILES INTO A NAVIGABLE INTERACTIVE SPATIAL CANVAS.
                </motion.p>

                <motion.p variants={itemVariants}>
                  YOU POINT IT AT A YAML MARKDOWN, AND YOUR DOCUMENTATION BECOMES NODES ON AN INFINITE CANVAS, WITH RELATIONSHIPS YOU CAN DRAW BETWEEN THEM, SCHEMAS THAT DEFINE WHAT EACH NODE TYPE MEANS, AND AN EDITOR FOR KEEPING CONTENT CURRENT AND UPDATED.
                </motion.p>

                {/* Spatial Grid Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <motion.div variants={itemVariants} className="relative border border-border/10 p-4 rounded-none bg-secondary/[0.01] pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/30" />
                    <h3 className="text-xs font-black tracking-widest mb-1.5 flex items-center gap-2">
                      <Layers size={12} className="text-foreground/60" />
                      AUTO_SYNC_PIPELINE
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed tracking-widest uppercase">
                      THE MAP ISN'T SEPARATE FROM YOUR REPO. EDITS SYNC BACK TO MARKDOWN FILES AUTOMATICALLY, PREVENTING OBSOLESCENCE.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative border border-border/10 p-4 rounded-none bg-secondary/[0.01] pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/30" />
                    <h3 className="text-xs font-black tracking-widest mb-1.5 flex items-center gap-2">
                      <GitBranch size={12} className="text-foreground/60" />
                      FLEXIBLE_SCHEMAS
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed tracking-widest uppercase">
                      DEFINE WHAT EACH NODE TYPE MEANS. YOUR WORKSPACE REFLECTS HOW YOUR TEAM THINKS, NOT HOW THE TOOL DICTATES.
                    </p>
                  </motion.div>
                </div>

                <motion.p variants={itemVariants} className="pt-2">
                  THE WAY INGESTALT HANDLES DIFFERENT TYPES OF INFORMATION IS FLEXIBLE BY DESIGN. INSTEAD OF THE TOOL DECIDING WHAT DATABASE LOOKS LIKE, YOU DEFINE IT YOURSELF!
                </motion.p>

                <motion.p variants={itemVariants}>
                  INSIDE THE TOOL, EACH DEFINITION LIVES IN YOUR WORKSPACE ALONGSIDE EVERYTHING ELSE. THIS MEANS YOUR PROJECT'S STRUCTURE REFLECTS HOW YOUR TEAM ACTUALLY THINKS ABOUT IT, NOT THE TOOL THAT THINKS YOU SHOULD ORGANIZE THINGS. AND BECAUSE EVERYTHING SYNCS BACK TO YOUR FILES, ANYONE NEW COMING TO THE CODEBASE HAS SOMEWHERE REAL TO START!
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Inquiry / Quote Banner */}
          <motion.div 
            variants={itemVariants} 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="border border-border/10 bg-secondary/[0.02] p-8 text-center my-12 rounded-none relative overflow-hidden"
          >
            <div className="text-xs tracking-widest text-muted-foreground mb-4 font-mono">CORE_INQUIRY</div>
            <p className="text-base md:text-lg font-black tracking-widest text-foreground leading-relaxed uppercase">
              "DO DEVELOPERS AND AI BOTH DO BETTER WORK WHEN THEY ACTUALLY SEE THE FULL PICTURE OF A SYSTEM?"
            </p>
            <div className="mt-4 text-xs font-bold text-foreground/40 tracking-widest">INGESTALT IS OUR ANSWER.</div>
          </motion.div>

          {/* Hackathon Specs Panel */}
          <motion.div 
            variants={itemVariants}
            className="border border-border/10 bg-secondary/[0.01] p-6 rounded-none relative overflow-hidden mb-12"
          >
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 pb-2 border-b border-border/10">
              <CalendarDays size={14} />
              THE_PROJECT_ORIGIN
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed tracking-wider">
              OUR TEAM, <strong className="text-foreground font-black">DLDMASTERS</strong>, BUILT INGESTALT IN 48 HOURS AT THE IBM BOB HACKATHON FROM MAY 15 TO 17, 2026, WITH IBM BOB AS OUR DEVELOPMENT PARTNER FOR THE PROJECT. WE BELIEVE SPATIAL IDEs ARE THE FUTURE OF COMPLEX SYSTEM DESIGN.
            </p>
          </motion.div>

          {/* Team Section */}
          <motion.div 
            variants={itemVariants}
            className="pt-4 border-t border-border/10"
          >
            <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground mb-6">THE_DEVELOPMENT_TEAM</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a 
                href="https://github.com/DrDpr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-4 rounded-none bg-secondary/[0.02] hover:bg-secondary/[0.08] border border-border/10 hover:border-foreground/30 transition-all shadow-none group"
              >
                <div className="w-12 h-12 rounded-none bg-background overflow-hidden border border-border/10 relative shrink-0">
                  <img 
                    src="https://github.com/DrDpr.png" 
                    alt="DrDpr" 
                    className="w-full h-full object-cover rounded-none grayscale group-hover:grayscale-0 transition-all" 
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-foreground truncate tracking-widest text-xs">DRDPR</span>
                  <span className="text-xs text-muted-foreground/60 tracking-wider">LEAD_DEVELOPER</span>
                </div>
              </a>

              <a 
                href="https://github.com/julius-salinas" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-4 rounded-none bg-secondary/[0.02] hover:bg-secondary/[0.08] border border-border/10 hover:border-foreground/30 transition-all shadow-none group"
              >
                <div className="w-12 h-12 rounded-none bg-background overflow-hidden border border-border/10 relative shrink-0">
                  <img 
                    src="https://github.com/julius-salinas.png" 
                    alt="julius-salinas" 
                    className="w-full h-full object-cover rounded-none grayscale group-hover:grayscale-0 transition-all" 
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-foreground truncate tracking-widest text-xs">JULIUS-SALINAS</span>
                  <span className="text-xs text-muted-foreground/60 tracking-wider">FULLSTACK_ENGINEER</span>
                </div>
              </a>

              <a 
                href="https://github.com/Zadkiel-O" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-4 rounded-none bg-secondary/[0.02] hover:bg-secondary/[0.08] border border-border/10 hover:border-foreground/30 transition-all shadow-none group"
              >
                <div className="w-12 h-12 rounded-none bg-background overflow-hidden border border-border/10 relative shrink-0">
                  <img 
                    src="https://github.com/Zadkiel-O.png" 
                    alt="Zadkiel-O" 
                    className="w-full h-full object-cover rounded-none grayscale group-hover:grayscale-0 transition-all" 
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-foreground truncate tracking-widest text-xs">ZADKIEL-O</span>
                  <span className="text-xs text-muted-foreground/60 tracking-wider">INTERFACE_DESIGNER</span>
                </div>
              </a>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 border-t border-border/10 mt-12 bg-secondary/[0.01]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono uppercase tracking-widest">
            <p>© 2026 INGESTALT // BY DLDMASTERS. PARTNERED WITH IBM BOB.</p>
            <div className="flex gap-6">
              <span className="text-muted-foreground">LATENCY: 0MS</span>
              <span className="text-muted-foreground">SECURE: LOCAL_ONLY</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
