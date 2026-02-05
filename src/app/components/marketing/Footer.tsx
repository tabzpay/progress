import { Handshake, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function Footer() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <footer className="py-12 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Handshake className="w-6 h-6 text-primary" />
                            <span className="font-bold text-lg">Progress</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Making informal lending simple, transparent, and relationship-friendly.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/features"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/how-it-works"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    How it Works
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/pricing"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/stories"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Stories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="pt-12 border-t border-border">
                    <div className="max-w-md">
                        <h3 className="font-semibold mb-2 text-lg">Stay up to date</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Get the latest updates on new features and product releases. No spam, ever.
                        </p>
                        {!isSubscribed ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setIsLoading(true);
                                    setTimeout(() => {
                                        setIsLoading(false);
                                        setIsSubscribed(true);
                                    }, 1500);
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-11 bg-muted/50 border-border"
                                    required
                                />
                                <Button type="submit" className="h-11 px-6 shadow-md shadow-primary/10" disabled={isLoading}>
                                    {isLoading ? "Subscribing..." : "Subscribe"}
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 py-2 px-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-sm font-medium w-fit"
                            >
                                <Send className="w-4 h-4" />
                                Thanks for subscribing! We'll be in touch soon.
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Progress Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <a href="https://twitter.com/progressapp" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="https://linkedin.com/company/progressapp" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
                        <a href="https://github.com/progressapp" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
