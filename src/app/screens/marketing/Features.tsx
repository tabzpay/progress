import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";
import { Button } from "../../components/ui/button";
import { Users, Bell, FileText, Download, Globe, Shield, Zap, PieChart } from "lucide-react";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Features() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />

            <main className="pt-20 pb-24">
                {/* Hero */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                            More than just a <span className="text-primary">spreadsheet</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Purpose-built tools to handle the nuances of personal and community lending.
                        </p>
                    </motion.div>
                </section>

                {/* Feature Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 mb-24">
                        <div className="space-y-8">
                            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                                <Users className="w-12 h-12 text-primary mb-6" />
                                <h2 className="text-2xl font-bold mb-4">Community Savings Groups</h2>
                                <p className="text-muted-foreground mb-6">
                                    Perfect for ROSCAs, Chit Funds, or Pardnas. Manage rotating savings with complete transparency.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                                        <span>Set contribution amounts and schedules</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                                        <span>Randomize or manual payout order</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                                        <span>Track who has paid for the current cycle</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                                <Bell className="w-12 h-12 text-orange-600 mb-6" />
                                <h2 className="text-2xl font-bold mb-4">Smart Reminders</h2>
                                <p className="text-muted-foreground mb-6">
                                    Customize how and when you want to be notified. We maintain the relationship by being the neutral third party.
                                </p>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Reminder Tone</span>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Friendly</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">"Hey! Just a heads up that your payment is coming up soon. 🌟"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* More Features */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Download, title: "Export Data", desc: "Download your entire transaction history as CSV or PDF for tax purposes." },
                            { icon: Globe, title: "Multi-Currency", desc: " Lending across borders? Track loans in USD, EUR, GBP, NGN, and 30+ other currencies." },
                            { icon: Shield, title: "Bank-Grade Security", desc: "Your data is encrypted at rest and in transit. We never sell your personal financial data." },
                            { icon: Zap, title: "Instant Settlements", desc: "Mark payments as 'Paid' instantly. (Payment processing integration coming soon)." },
                            { icon: FileText, title: "Legal Templates", desc: "Generate a basic loan agreement PDF that you can print and sign for extra security." },
                            { icon: PieChart, title: "Visual Analytics", desc: "See your total lending volume, repayment rates, and outstanding balance at a glance." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 border rounded-2xl hover:border-primary/50 transition-colors"
                            >
                                <feature.icon className="w-8 h-8 text-muted-foreground mb-4" />
                                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="mt-32 text-center">
                    <h2 className="text-3xl font-bold mb-6">Start using these features today</h2>
                    <Button size="lg" asChild className="h-12 px-8 rounded-full">
                        <Link to="/get-started">Get Started Free</Link>
                    </Button>
                </section>
            </main>

            <Footer />
        </div>
    );
}
