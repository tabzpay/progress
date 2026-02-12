import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Header } from "../components/marketing/Header";
import { Footer } from "../components/marketing/Footer";
import {
  CheckCircle,
  Shield,
  Users,
  Bell,
  TrendingUp,
  Handshake,
  UserCheck,
  Eye,
  Star,
  ChevronRight,
  ArrowRight,
  Check,
  Lock,
  Zap,
  ChevronDown,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { SEO } from "../components/SEO";
import { useState, useEffect } from "react";
import { cn } from "../components/ui/utils";
import { useAuth } from "../../lib/contexts/AuthContext";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const headerY = useTransform(scrollY, [0, 50], [-20, 0]);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <SEO
        title="Home"
        description="Informal Lending, Reimagined. Track loans, build credit, and maintain healthy financial relationships with Progress."
      />
      <Header />

      {/* Hero Section - Overhauled for Premium Feel */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#fdfdfd]" />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-400/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -40, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-indigo-100 mb-8 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-950">New: Version 2.0 is Live</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-8 leading-[1.05]">
                Lend with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Confidence.
                </span>
              </h1>

              <p className="text-xl text-slate-500 mb-10 max-w-xl leading-relaxed font-medium">
                Ditch the spreadsheets and awkward follow-ups. Progress creates professional, shared records for every informal loan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center mb-12">
                <Button size="lg" asChild className="h-16 px-10 text-lg rounded-[2rem] bg-slate-950 hover:bg-slate-800 shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-all">
                  <Link to="/get-started">
                    Start Tracking Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <div className="flex -space-x-3 ml-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                    +10k
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide">No Cards</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide">Secure Logs</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              {/* Premium Dashboard Mockup Container */}
              <div className="relative z-10 p-4 bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[3rem] shadow-3xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
                <div className="rounded-[2rem] overflow-hidden border border-slate-200/50 bg-white shadow-2xl">
                  {/* Mock UI Header */}
                  <div className="h-14 border-b bg-slate-50 flex items-center px-6 justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                    </div>
                    <div className="px-3 py-1 bg-white border rounded-full text-[10px] font-black tracking-widest uppercase text-slate-400">
                      Shared Ledger
                    </div>
                  </div>
                  {/* Mock UI Content */}
                  <div className="p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-slate-100 rounded-full" />
                        <div className="h-8 w-8 rounded-full bg-indigo-50" />
                      </div>
                      <div className="h-32 w-full bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 flex items-end">
                        <div className="space-y-2">
                          <div className="h-2 w-16 bg-indigo-200 rounded-full" />
                          <div className="h-6 w-32 bg-indigo-600 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-2xl space-y-3">
                        <div className="h-2 w-12 bg-slate-100 rounded-full" />
                        <div className="h-4 w-20 bg-slate-900 rounded-full" />
                      </div>
                      <div className="p-4 border rounded-2xl space-y-3">
                        <div className="h-2 w-12 bg-slate-100 rounded-full" />
                        <div className="h-4 w-20 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-4 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-400">Status</div>
                    <div className="font-bold text-sm">Paid in Full</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-8 -left-8 z-20 bg-white/80 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-white/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-400">Growth</div>
                    <div className="font-bold text-lg">+8.5% confidence</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logo Cloud - Social Proof Marquee (Mobile Optimized) */}
      <section className="py-12 border-y border-slate-100 bg-white/50 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
            Empowering relationships worldwide
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee flex gap-12 sm:gap-24 items-center whitespace-nowrap min-w-full justify-around opacity-40 grayscale px-6">
            {['Trustify', 'Nexus', 'SecurePay', 'Equinox', 'Vertex', 'Trustify', 'Nexus', 'SecurePay', 'Equinox', 'Vertex'].map((name, i) => (
              <div key={`${name}-${i}`} className="text-xl sm:text-2xl font-black tracking-tighter hover:grayscale-0 transition-opacity cursor-default hover:opacity-100 px-4">
                {name}
              </div>
            ))}
          </div>

          {/* Marquee Second Copy for Seamless Loop */}
          <div className="absolute top-0 animate-marquee2 flex gap-12 sm:gap-24 items-center whitespace-nowrap min-w-full justify-around opacity-40 grayscale px-6">
            {['Trustify', 'Nexus', 'SecurePay', 'Equinox', 'Vertex', 'Trustify', 'Nexus', 'SecurePay', 'Equinox', 'Vertex'].map((name, i) => (
              <div key={`${name}-copy-${i}`} className="text-xl sm:text-2xl font-black tracking-tighter hover:grayscale-0 transition-opacity cursor-default hover:opacity-100 px-4">
                {name}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes marquee2 {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee2 {
            animation: marquee2 30s linear infinite;
          }
        `}</style>
      </section>

      {/* Features Grid - Upgraded with Glassmorphism */}
      <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle Background Decoration */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-[11px] uppercase font-black tracking-[0.3em] text-indigo-600 mb-4">Core Principles</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-950 mb-6">Lending, reimagined</h3>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              We've stripped away the complexity, leaving just the tools you need to build trust and maintain relationships.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: "Neutral Records",
                desc: "Create clear, shared agreements. No 'he said, she said' ever again.",
                color: "indigo"
              },
              {
                icon: Bell,
                title: "Smart Reminders",
                desc: "We send the awkward reminder texts so you don't have to. Perfectly timed.",
                color: "blue"
              },
              {
                icon: Eye,
                title: "Total Visibility",
                desc: "Both parties see the exact same dashboard and balance in real-time.",
                color: "indigo"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white hover:border-indigo-100 shadow-xl shadow-indigo-900/5 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110",
                  feature.color === "indigo" ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"
                )}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-950 mb-4">{feature.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works - Redesigned for Clarity */}
      <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-[11px] uppercase font-black tracking-[0.3em] text-blue-600 mb-4">The Workflow</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-950">Simple from start to end</h3>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-16 lg:gap-24">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.75rem] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {[
              { step: 1, title: "Craft Agreement", desc: "Set amount, due date, and payout details in seconds.", color: "bg-indigo-600 shadow-indigo-200" },
              { step: 2, title: "Secure Invite", desc: "Share a private link via WhatsApp, SMS, or any chat.", color: "bg-blue-600 shadow-blue-200" },
              { step: 3, title: "Sync & Track", desc: "Both parties view live updates as payments are made.", color: "bg-emerald-600 shadow-emerald-200" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative text-center group"
              >
                <div className={cn(
                  "w-22 h-22 rounded-full flex items-center justify-center mx-auto mb-10 relative z-10 shadow-2xl transition-transform group-hover:scale-110 duration-500",
                  item.color,
                  "text-white p-6"
                )}>
                  <span className="text-3xl font-black">{item.step}</span>
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-5 pointer-events-none" />
                </div>
                <h4 className="text-2xl font-black text-slate-950 mb-4">{item.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by modern lenders</h2>
            <div className="flex justify-center gap-1 text-warning mb-2">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-5 h-5 fill-current" />)}
            </div>
            <p className="text-muted-foreground">Rated 4.9/5 by 10,000+ users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Alex Rivera", role: "Freelancer", quote: "I lent money to my brother for his car. Progress made it easy to keep track without making our holiday dinners awkward." },
              { name: "Sarah Jenkins", role: "Small Business", quote: "Essential for my side business. I use it to track vendor deposits and short-term credit. The reminders are a lifesaver." },
              { name: "Mike Chen", role: "Student", quote: "My roommates and I use this for larger split expenses. It's so much better than just a spreadsheet." }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-6 rounded-2xl shadow-sm border border-border"
              >
                <div className="flex gap-1 text-warning mb-4">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Premium Cards */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-[11px] uppercase font-black tracking-[0.3em] text-indigo-600 mb-4">Our Plans</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-950 mb-6">Fair for everyone</h3>
            <p className="text-lg text-slate-500 font-medium">Most people use Progress for free, forever.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              whileHover={{ y: -8 }}
              className="p-10 rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-indigo-900/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 group-hover:bg-indigo-500 transition-colors" />
              <h4 className="text-2xl font-black text-slate-900 mb-2">Personal</h4>
              <div className="text-5xl font-black text-slate-900 mb-8 tabular-nums">$0<span className="text-lg font-bold text-slate-400">/mo</span></div>
              <ul className="space-y-5 mb-10">
                {[
                  "Track up to 5 active loans",
                  "Shared real-time dashboard",
                  "Standard email reminders",
                  "Basic payout logging"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full h-14 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none font-bold" variant="outline" asChild>
                <Link to="/get-started">Start Free Forever</Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="p-10 rounded-[2.5rem] border-2 border-slate-900 bg-slate-900 text-white shadow-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 py-2 px-6 bg-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-2xl">
                Most Popular
              </div>
              <h4 className="text-2xl font-black mb-2">Pro Power</h4>
              <div className="text-5xl font-black mb-8 tabular-nums">$5<span className="text-lg font-bold text-slate-400">/mo</span></div>
              <ul className="space-y-5 mb-10">
                {[
                  "Unlimited active loans",
                  "SMS & WhatsApp reminders",
                  "Export to PDF/CSV",
                  "Priority support & Verified Badge"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-100">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-white/90 font-bold border-none shadow-xl" asChild>
                <Link to="/get-started">Go Pro Now</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10,000+", label: "Active Users" },
              { number: "$2.5M+", label: "Loans Tracked" },
              { number: "25,000+", label: "Payments Logged" },
              { number: "4.9/5", label: "User Rating" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.number}</div>
                <div className="text-primary-foreground/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Badges */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted & Secure</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your data security and privacy are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Bank-Grade Encryption",
                description: "All data encrypted with AES-256 encryption at rest and in transit"
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "We never sell your data. Your financial information stays private"
              },
              {
                icon: Zap,
                title: "99.9% Uptime",
                description: "Reliable service backed by enterprise-grade infrastructure"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Progress
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does Progress help me track loans?",
                answer: "Progress creates a shared, transparent record of every loan. Both parties can see the same information, including amounts, due dates, and payment history. Automated reminders keep everyone on track."
              },
              {
                question: "Is my financial data secure?",
                answer: "Absolutely. We use bank-grade AES-256 encryption for all data. Your information is never sold to third parties, and we're compliant with industry security standards."
              },
              {
                question: "Can I use Progress for free?",
                answer: "Yes! Our free plan supports up to 5 active loans with unlimited payment history. It's perfect for casual lending between friends and family. Pro plans unlock unlimited loans and advanced features."
              },
              {
                question: "How do both parties access the loan information?",
                answer: "When you create a loan, you share a unique link (via WhatsApp, SMS, or email). The recipient clicks the link to view and accept the agreement. Both of you then have access to the same dashboard."
              },
              {
                question: "What if someone doesn't pay me back?",
                answer: "While Progress helps track loans and send reminders, we're not a debt collection service. We recommend using Progress for informal lending with people you trust. You can export records as PDFs if you need them for legal purposes."
              },
              {
                question: "Can I cancel or modify a loan?",
                answer: "Yes, you can edit loan details (with mutual agreement) or mark loans as forgiven/cancelled at any time. All changes are logged in the payment history for transparency."
              }
            ].map((faq, i) => {
              const [isOpen, setIsOpen] = useState(false);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-lg pr-8">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                        isOpen && "transform rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 text-muted-foreground"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Footer - Enhanced */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-primary" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-white/90 text-sm font-medium"
          >
            <Shield className="w-4 h-4" />
            <span>Trusted by 10,000+ users</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight"
          >
            Ready to clear the air?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands keeping money matters simple, transparent, and relationship-friendly.
          </motion.p>

          {/* Dual CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="h-14 px-8 text-lg rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Link to="/get-started">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 px-8 text-lg rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
            >
              <a href="#how-it-works">
                See How It Works
              </a>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Free forever plan</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Setup in 2 minutes</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
}
