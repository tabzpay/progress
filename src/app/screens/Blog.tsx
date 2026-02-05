import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Header } from '../components/marketing/Header';
import { Footer } from '../components/marketing/Footer';

export default function Blog() {
    const articles = [
        {
            title: '5 Tips for Managing Informal Loans with Friends',
            excerpt: 'Learn how to maintain healthy relationships while lending money to friends and family...',
            date: '2024-01-15',
            readTime: '5 min read',
            category: 'Best Practices',
        },
        {
            title: 'Understanding Interest Rates in Peer-to-Peer Lending',
            excerpt: 'A comprehensive guide to setting fair interest rates for informal loans...',
            date: '2024-01-10',
            readTime: '8 min read',
            category: 'Finance',
        },
        {
            title: 'How Progress Keeps Your Financial Data Secure',
            excerpt: 'Behind the scenes of our bank-grade security infrastructure and privacy practices...',
            date: '2024-01-05',
            readTime: '6 min read',
            category: 'Security',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Progress
                            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Blog
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Tips, insights, and stories about informal lending, personal finance, and building stronger financial relationships
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Coming Soon Notice */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center mb-12"
                    >
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">Blog Coming Soon!</h2>
                        <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                            We're working on creating valuable content to help you make the most of informal lending.
                            Subscribe to our newsletter to be notified when we publish our first articles.
                        </p>
                        <Button variant="secondary" size="lg" asChild>
                            <a href="/#newsletter">Subscribe to Newsletter</a>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Preview Articles */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">What's Coming</h2>
                        <p className="text-slate-600">Preview of articles we're preparing for you</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {articles.map((article, index) => (
                            <motion.article
                                key={article.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow group cursor-pointer"
                            >
                                {/* Article Header Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full text-sm font-medium">
                                            {article.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-slate-600 mb-4 line-clamp-2">{article.excerpt}</p>

                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(article.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {article.readTime}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                                            Coming Soon <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200 text-center"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Never Miss an Update</h2>
                        <p className="text-slate-600 mb-8">
                            Get notified when we publish new articles, product updates, and exclusive tips for managing your loans
                        </p>
                        <Button size="lg" asChild>
                            <a href="/#newsletter">
                                Subscribe to Newsletter <ArrowRight className="ml-2" />
                            </a>
                        </Button>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
