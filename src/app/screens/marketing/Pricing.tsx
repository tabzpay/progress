import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";
import { Button } from "../../components/ui/button";
import { Check, X, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Pricing() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />

            <main className="pt-20 pb-24">
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Start for free. Upgrade as you grow. No hidden fees.
                        </p>
                    </motion.div>
                </section>

                {/* Pricing Cards */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free */}
                        <div className="p-8 rounded-3xl border bg-background shadow-sm">
                            <h3 className="font-bold text-xl mb-2">Starter</h3>
                            <div className="text-4xl font-bold mb-2">$0</div>
                            <p className="text-muted-foreground text-sm mb-6">For casual lending between friends.</p>
                            <Button variant="outline" className="w-full mb-8" asChild>
                                <Link to="/get-started">Get Started</Link>
                            </Button>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> 5 Active Loans</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Basic Reminders</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> 1 Group</li>
                                <li className="flex gap-3 text-muted-foreground"><X className="w-5 h-5" /> Export Data</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-3xl border-2 border-primary bg-primary/5 shadow-xl relative">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                            <h3 className="font-bold text-xl mb-2">Pro</h3>
                            <div className="text-4xl font-bold mb-2">$5<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                            <p className="text-muted-foreground text-sm mb-6">Power users and community organizers.</p>
                            <Button className="w-full mb-8" asChild>
                                <Link to="/auth">Start Free Trial</Link>
                            </Button>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Unlimited Active Loans</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> SMS & WhatsApp Reminders</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Unlimited Groups</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> PDF/CSV Export</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Priority Support</li>
                            </ul>
                        </div>

                        {/* Business */}
                        <div className="p-8 rounded-3xl border bg-background shadow-sm">
                            <h3 className="font-bold text-xl mb-2">Business</h3>
                            <div className="text-4xl font-bold mb-2">$29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                            <p className="text-muted-foreground text-sm mb-6">For micro-lenders and small businesses.</p>
                            <Button variant="outline" className="w-full mb-8" asChild>
                                <a href="mailto:sales@progress.app">Contact Sales</a>
                            </Button>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Everything in Pro</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> API Access</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Team Members (up to 5)</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Custom Branding</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-primary" /> Legal Contract Templates</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
                            <p className="text-muted-foreground text-sm">Yes. You can cancel your subscription at any time from your settings page. You'll keep access until the end of your billing period.</p>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">Is there a transaction fee?</h3>
                            <p className="text-muted-foreground text-sm">No. We don't process payments directly, so we don't charge transaction fees. We only charge for the software subscription.</p>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">What happens to my data if I downgrade?</h3>
                            <p className="text-muted-foreground text-sm">Your data is safe. If you have more than 5 active loans, you'll just need to archive some to create new ones.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
