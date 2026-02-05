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

            {/* Mobile Menu - Full Screen Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] md:hidden"
                    >
                        {/* Backdrop Blur */}
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl" />

                        {/* Menu Content */}
                        <div className="relative h-full flex flex-col px-8 pt-24 pb-12">
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-5 right-5 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex-1 space-y-8">
                                <p className="text-[10px] uppercase font-black tracking-[0.4em] text-indigo-500 mb-8">Navigation</p>
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            to={link.href}
                                            className="text-4xl font-black text-slate-950 hover:text-indigo-600 transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-4"
                            >
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full h-16 rounded-2xl text-lg font-bold border-slate-200"
                                >
                                    <Link to="/sign-in">Sign In</Link>
                                </Button>
                                <Button asChild className="w-full h-16 rounded-2xl text-lg font-bold bg-slate-950 shadow-xl">
                                    <Link to="/get-started">Get Started</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
