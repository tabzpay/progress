import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Handshake, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../components/ui/utils";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: "Features", href: "/features" },
        { name: "How it Works", href: "/how-it-works" },
        { name: "Pricing", href: "/pricing" },
        { name: "Stories", href: "/stories" },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/60"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <Handshake className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">Progress</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        location.pathname === link.href
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <Button variant="ghost" asChild className="font-medium">
                                <Link to="/sign-in">Sign In</Link>
                            </Button>
                            <Button asChild className="font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                <Link to="/get-started">Get Started</Link>
                            </Button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu - Full Screen Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] md:hidden"
                    >
                        {/* Ultra-Transparent Premium Glass - Extreme blur melts underlying content */}
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl" />

                        {/* Menu Content */}
                        <div className="relative h-full flex flex-col px-8 pt-6 pb-12">
                            {/* Brand and Close Header - Minimalist */}
                            <div className="flex items-center justify-between mb-20 h-16">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="bg-slate-950 p-2.5 rounded-2xl shadow-xl shadow-slate-900/20">
                                        <Handshake className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter text-slate-950">Progress</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md border border-white/50 text-slate-950 shadow-sm hover:bg-white"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="flex-1 flex flex-col justify-start">
                                <p className="text-[10px] uppercase font-black tracking-[1em] text-indigo-600 mb-10 opacity-40">Menu</p>
                                <nav className="flex flex-col gap-6">
                                    {navLinks.map((link, i) => (
                                        <motion.div
                                            key={link.name}
                                            initial={{ x: -30, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                                        >
                                            <Link
                                                to={link.href}
                                                className="text-3xl sm:text-4xl font-black text-slate-950 hover:text-indigo-600 transition-all tracking-tighter flex items-center gap-3"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {link.name}
                                                {link.name === "Stories" && (
                                                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100 align-middle transform -translate-y-1">
                                                        +10k
                                                    </span>
                                                )}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </nav>
                            </div>

                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-2 gap-4 mt-auto pt-10"
                            >
                                <Button
                                    variant="outline"
                                    asChild
                                    className="h-20 rounded-[2rem] text-xl font-black border-white/50 bg-white/20 backdrop-blur-md text-slate-950 shadow-xl shadow-slate-900/5 relative overflow-hidden"
                                >
                                    <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="w-3 h-3 rounded-full bg-rose-400 mr-3" />
                                        Login
                                    </Link>
                                </Button>
                                <Button asChild className="h-20 rounded-[2rem] text-xl font-black bg-slate-950 text-white shadow-2xl shadow-indigo-500/10 active:scale-95 transition-all">
                                    <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>Join</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
