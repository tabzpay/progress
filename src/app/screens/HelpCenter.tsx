import { motion } from 'motion/react';
import { Search, Book, MessageCircle, FileText, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Header } from '../components/marketing/Header';
import { Footer } from '../components/marketing/Footer';
import { useState } from 'react';

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        {
            icon: Book,
            title: 'Getting Started',
            description: 'Learn the basics of using Progress',
            articles: ['Creating your first loan', 'Understanding the dashboard', 'Setting up your profile'],
        },
        {
            icon: FileText,
            title: 'Loan Management',
            description: 'Tips for tracking and managing loans',
            articles: ['Recording payments', 'Setting payment reminders', 'Managing multiple loans'],
        },
        {
            icon: HelpCircle,
            title: 'Common Questions',
            description: 'Answers to frequently asked questions',
            articles: ['How is interest calculated?', 'Can I export my data?', 'Is my information secure?'],
        },
        {
            icon: MessageCircle,
            title: 'Account & Billing',
            description: 'Manage your account and subscription',
            articles: ['Updating account settings', 'Billing information', 'Canceling subscription'],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />

            {/* Hero Section with Search */}
            <section className="relative pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            How can we
                            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                help you?
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                            Search our knowledge base or browse categories below
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-4 text-lg rounded-2xl shadow-lg border-slate-300"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {categories.map((category, index) => {
                            const Icon = category.icon;
                            return (
                                <motion.div
                                    key={category.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{category.title}</h3>
                                            <p className="text-slate-600">{category.description}</p>
                                        </div>
                                    </div>

                                    <ul className="space-y-3">
                                        {category.articles.map((article) => (
                                            <li key={article}>
                                                <a
                                                    href="#"
                                                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 group/link"
                                                >
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full group-hover/link:scale-150 transition-transform" />
                                                    {article}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Still Need Help */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center"
                    >
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-lg text-blue-100 mb-8">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="secondary" size="lg" asChild>
                                <a href="/contact">Contact Support</a>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                asChild
                            >
                                <a href="/#faq">View FAQ</a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
