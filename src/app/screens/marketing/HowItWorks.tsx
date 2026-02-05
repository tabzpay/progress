import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";
import { Button } from "../../components/ui/button";
import { Shield, Bell, CheckCircle, ChevronRight, MessageSquare, AlertTriangle, Lock, Banknote } from "lucide-react";
import { Card } from "../../components/ui/card";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HowItWorks() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />

            <main className="pt-20 pb-24">
                {/* Hero */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                            Lending made <span className="text-primary">simple</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            From creating an agreement to getting paid back, here's exactly how Progress handles the details so you don't have to.
                        </p>
                    </motion.div>
                </section>

                {/* Deep Dive Steps */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
                    {/* Step 1 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-3xl transform -rotate-3 blur-2xl" />
                            <Card className="relative p-6 border-2 border-primary/20 shadow-xl bg-background">
                                <div className="space-y-4">
                                    <div className="h-4 w-1/3 bg-muted rounded" />
                                    <div className="h-10 bg-primary/5 border border-primary/20 rounded-md flex items-center px-3 text-lg font-medium">
                                        $ 500.00
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-10 bg-muted rounded-md" />
                                        <div className="h-10 bg-muted rounded-md" />
                                    </div>
                                    <Button className="w-full">Create Loan Link</Button>
                                </div>
                            </Card>
                        </div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="order-1 md:order-2"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-6">1</div>
                            <h2 className="text-3xl font-bold mb-4">Create the Agreement</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                It takes less than 30 seconds. Enter the amount, the repayment date, and any interest (if applicable).
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Flexible repayment schedules (weekly, monthly, one-time)",
                                    "Optional interest calculator",
                                    "Add notes for context (e.g., 'Rent help')"
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span className="text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-6">2</div>
                            <h2 className="text-3xl font-bold mb-4">Share & Confirm</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                Send the link via WhatsApp, SMS, or email. The borrower sees the exact terms and must tap "Accept" to activate the loan.
                            </p>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                <div className="flex gap-3">
                                    <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-medium mb-1">What if they decline?</p>
                                        <p>The loan stays in "Draft" mode. You can edit the terms and resend, or cancel it entirely. Nothing is recorded until both sides agree.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <div className="relative">
                            {/* Visual placeholder for sharing flow */}
                            <div className="relative rounded-3xl overflow-hidden border shadow-2xl bg-white max-w-xs mx-auto">
                                <div className="bg-zinc-100 p-4 border-b">
                                    <div className="w-16 h-1 bg-zinc-300 rounded-full mx-auto" />
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] text-sm">
                                        Hey, I sent the loan details we discussed. Check it here: progress.app/l/xyz123
                                    </div>
                                    <div className="text-center text-xs text-muted-foreground my-2">12:42 PM</div>
                                    <div className="bg-zinc-100 p-4 rounded-xl border">
                                        <div className="font-semibold mb-1">Loan Offer: $500</div>
                                        <div className="text-sm text-muted-foreground mb-3">From: Alex</div>
                                        <div className="h-8 bg-blue-600 rounded-md w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 relative">
                            <div className="absolute inset-0 bg-green-500/10 rounded-full blur-3xl" />
                            <div className="relative bg-background border rounded-2xl p-6 shadow-lg max-w-sm mx-auto">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Upcoming Payment</div>
                                        <div className="text-xs text-muted-foreground">Due in 3 days</div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    "Hi Sarah, just a friendly reminder that a payment of $100 for the 'Car Repair' loan is coming up on Friday."
                                </p>
                                <div className="text-xs text-center text-muted-foreground bg-muted/50 py-2 rounded">
                                    Sent automatically by Progress
                                </div>
                            </div>
                        </div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="order-1 md:order-2"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-600 text-white font-bold text-xl mb-6">3</div>
                            <h2 className="text-3xl font-bold mb-4">Automated Tracking</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                We handle the awkward part. Progress sends neutral, automated reminders before payments are due.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Reminders sending 3 days before due date",
                                    "Instant notifications when payments are logged",
                                    "Live balance updates for both parties"
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* Security / FAQ Section */}
                <section className="mt-32 bg-secondary/20 py-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-16">Common Questions</h2>

                        <div className="grid gap-6">
                            {[
                                {
                                    icon: Lock,
                                    q: "Is my data secure?",
                                    a: "Yes. We use 256-bit encryption to store all financial data. Your records are private and visible only to you and the other party involved in the loan."
                                },
                                {
                                    icon: Banknote,
                                    q: "Does Progress move the money?",
                                    a: "No. You transfer the money using your preferred method (Cash, Venmo, Zelle, Bank Transfer). Progress is purely for record-keeping and tracking."
                                },
                                {
                                    icon: AlertTriangle,
                                    q: "Is this a legal contract?",
                                    a: "The agreement generated by Progress serves as a record of debt. While we provide a digital trail, we recommend consulting a legal professional for large amounts or strict legal enforceability."
                                }
                            ].map((item, i) => (
                                <Card key={i} className="p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="pt-24 text-center px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to give it a try?</h2>
                    <Button size="lg" asChild className="h-12 px-8 rounded-full">
                        <Link to="/get-started">Create a Free Account</Link>
                    </Button>
                </section>
            </main>

            <Footer />
        </div>
    );
}
