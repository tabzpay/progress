import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";
import { Button } from "../../components/ui/button";
import { Star, Quote } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback"; // Assuming this exists or replace with img

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Stories() {
    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            <Header />

            <main className="pt-20 pb-24">
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <div className="text-green-600 font-medium mb-4 tracking-wide uppercase text-sm">Community Stories</div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                            Real people, <br />
                            <span className="text-primary">Real relationships saved</span>
                        </h1>
                    </motion.div>
                </section>

                {/* Featured Story */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="bg-muted/30 rounded-3xl overflow-hidden grid md:grid-cols-2">
                        <div className="h-64 md:h-auto bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80")' }} />
                        <div className="p-8 md:p-16 flex flex-col justify-center">
                            <Quote className="w-10 h-10 text-primary/20 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">"It saved my small business"</h3>
                            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                                "I needed a bridge loan for inventory but didn't want to go to a bank. My uncle offered to help, but I insisted we use Progress. It made everything professional. He got his automatic updates, and I didn't feel like a child asking for allowance."
                            </p>
                            <div>
                                <div className="font-bold">Maria Gonzalez</div>
                                <div className="text-sm text-muted-foreground">Owner, MG Designs</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                text: "I run a monthly savings group with 10 friends. We used to use a notebook and WhatsApp. This app helps us track who has paid in seconds.",
                                author: "David K.",
                                role: "Community Organizer"
                            },
                            {
                                text: "No more awkward texts asking 'Hey, do you have that $50 yet?' The app does it for me. Worth every penny.",
                                author: "Jessica T.",
                                role: "Freelancer"
                            },
                            {
                                text: "Simple, clean, and does exactly what it says. The PDF export helped me prove my income for a rental application.",
                                author: "Marcus Ray",
                                role: "Gig Worker"
                            },
                            {
                                text: "My roommate and I split a new couch. We set up a payment plan on Progress and it's been smooth sailing since.",
                                author: "Emily C.",
                                role: "Student"
                            },
                            {
                                text: "The best part is transparency. I can see exactly how much I owe and when it's due without digging through texts.",
                                author: "Ryan P.",
                                role: "User"
                            },
                            {
                                text: "Customer support was super helpful when I needed to change a loan date. Great team behind this.",
                                author: "Sarah L.",
                                role: "Small Business Owner"
                            }
                        ].map((t, i) => (
                            <div key={i} className="bg-background p-8 rounded-2xl border shadow-sm break-inside-avoid">
                                <div className="flex gap-1 text-warning mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-muted-foreground mb-6 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                                        {t.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">{t.author}</div>
                                        <div className="text-xs text-muted-foreground">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-32 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join 10,000+ happy users</h2>
                    <Button size="lg" asChild className="h-12 px-8 rounded-full">
                        <Link to="/get-started">Create Account</Link>
                    </Button>
                </section>
            </main>

            <Footer />
        </div>
    );
}
