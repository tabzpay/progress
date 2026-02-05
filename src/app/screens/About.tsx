import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Users, Target, Heart, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/marketing/Header';
import { Footer } from '../components/marketing/Footer';

export default function About() {
    const values = [
        {
            icon: Users,
            title: 'Community First',
            description: 'We believe in empowering communities through financial tools that strengthen relationships and trust.',
        },
        {
            icon: Target,
            title: 'Simplicity',
            description: 'Complex problems deserve simple solutions. We make informal lending as easy as sending a text.',
        },
        {
            icon: Heart,
            title: 'Transparency',
            description: 'Every loan, every payment, every detail - clear and accessible to all parties involved.',
        },
        {
            icon: Shield,
            title: 'Security',
            description: 'Bank-grade encryption and privacy-first design protect your financial relationships.',
        },
    ];

    const team = [
        {
            name: 'Sarah Johnson',
            role: 'Co-Founder & CEO',
            bio: '10+ years in fintech, passionate about financial inclusion',
        },
        {
            name: 'Michael Chen',
            role: 'Co-Founder & CTO',
            bio: 'Former tech lead at major banks, building the future of lending',
        },
        {
            name: 'Aisha Patel',
            role: 'Head of Product',
            bio: 'User experience advocate with a background in community banking',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Making Informal Lending
                            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Safe and Simple
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                            We're on a mission to bring transparency, security, and peace of mind to the billions of dollars
                            exchanged through informal loans every year.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
                        <div className="prose prose-lg text-slate-700">
                            <p>
                                Progress was born from a simple observation: millions of people lend and borrow money from friends,
                                family, and colleagues every day. These informal loans total billions of dollars annually, yet they're
                                tracked in notebooks, spreadsheets, or just memory.
                            </p>
                            <p>
                                We saw too many relationships strained by forgotten amounts, missed payments, and unclear terms.
                                We knew there had to be a better way.
                            </p>
                            <p>
                                In 2023, our founding team came together with diverse backgrounds in fintech, community banking,
                                and product design. We built Progress to be the tool we wished existed: simple enough for anyone
                                to use, yet powerful enough to handle complex lending scenarios.
                            </p>
                            <p>
                                Today, over 10,000 users trust Progress to manage their informal lending relationships. We're
                                proud to be part of keeping friendships strong, families connected, and communities thriving.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
                        <p className="text-lg text-slate-600">The principles that guide everything we do</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                                    <p className="text-slate-600">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet the Team</h2>
                        <p className="text-lg text-slate-600">The people building the future of informal lending</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center hover:shadow-xl transition-shadow"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                                <p className="text-slate-600 text-sm">{member.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white"
                    >
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-lg text-blue-100 mb-8">
                            Join thousands of users who trust Progress to manage their lending relationships
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" variant="secondary">
                                <Link to="/get-started">
                                    Create Free Account <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                                <Link to="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
