import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, PieChart, Shield, Zap, Target } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { getToken } from "@/lib/auth";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export default function Landing() {
  const [location, setLocation] = useLocation();
  const isLoggedIn = !!getToken();
  
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() }});

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="w-8 h-8" />
            <span className="font-serif font-bold text-2xl text-foreground">Ledger</span>
          </div>
          <div className="flex gap-4 items-center">
            {isLoggedIn ? (
              <Button onClick={() => setLocation("/dashboard")} className="rounded-full shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLocation("/login")} className="hover:text-primary transition-colors">
                  Log in
                </Button>
                <Button onClick={() => setLocation("/register")} className="rounded-full shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10 mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-secondary text-primary text-sm font-medium mb-6 border border-primary/20">
              The anti-stress expense tracker
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-foreground mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            Money, <span className="text-primary italic">clarified.</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            A quiet, powerful space for tracking where your money goes. 
            Like a financial journal you actually enjoy opening. Precision without the clinical feel.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            <Button 
              size="lg" 
              className="rounded-full h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 group"
              onClick={() => setLocation(isLoggedIn ? "/dashboard" : "/register")}
            >
              {isLoggedIn ? "Open your Ledger" : "Start your Ledger"}
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating UI Elements Showcase */}
      <div className="relative max-w-5xl mx-auto px-6 mb-32 z-20">
        <motion.div 
          className="relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-card rounded-xl p-6 border border-border shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Total Balance</div>
              <div className="text-3xl font-serif font-bold text-foreground">$12,450.00</div>
              <div className="mt-4 flex items-center text-sm text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2" /> +$2,100 this month
              </div>
            </motion.div>

            <motion.div 
              className="bg-card rounded-xl p-6 border border-border shadow-lg"
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4 text-accent">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Recent Expense</div>
              <div className="text-xl font-bold text-foreground">Coffee Roasters</div>
              <div className="mt-2 text-2xl font-serif text-accent">-$34.50</div>
              <div className="mt-2 text-xs text-muted-foreground">Today, 9:41 AM</div>
            </motion.div>

            <motion.div 
              className="bg-card rounded-xl p-6 border border-border shadow-lg md:mt-8"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 text-foreground">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="text-sm text-muted-foreground mb-4">Top Categories</div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Housing</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Food</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[25%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24 border-t border-border/40 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Designed for clarity.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">No clutter, no ads, no aggressive nudges. Just your financial data, beautifully presented.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Elegant Insights", desc: "Understand your spending habits at a glance with beautiful, interactive charts.", icon: PieChart, color: "text-primary", bg: "bg-primary/10" },
            { title: "Frictionless Entry", desc: "Add transactions in seconds. The interface gets out of your way so you can get on with your day.", icon: Zap, color: "text-accent", bg: "bg-accent/10" },
            { title: "Private by Design", desc: "Your data is yours. We don't sell it, share it, or use it to target you with financial products.", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4 text-primary">
          <Wallet className="w-5 h-5" />
          <span className="font-serif font-bold text-xl text-foreground">Ledger</span>
        </div>
        <p className="text-sm">A crafted space for your finances.</p>
      </footer>
    </div>
  );
}
