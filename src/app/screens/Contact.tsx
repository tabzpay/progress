import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Header } from '../components/marketing/Header';
import { Footer } from '../components/marketing/Footer';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsLoading(false);
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Us',
            description: 'support@progressapp.com',
            action: 'mailto:support@progressapp.com',
        },
        {
            icon: MessageSquare,
            title: 'Live Chat',
            description: 'Mon-Fri, 9am-6pm EST',
            action: '#',
        },
        {
            icon: Phone,
            title: 'Call Us',
            description: '+1 (555) 123-4567',
            action: 'tel:+15551234567',
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            description: '123 Fintech Ave, San Francisco, CA',
            action: '#',
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
                            Get in
                            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Touch
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Have a question or need help? We're here to assist you. Choose your preferred way to reach us.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-6">
                        {contactMethods.map((method, index) => {
                            const Icon = method.icon;
                            return (
                                <motion.a
                                    key={method.title}
                                    href={method.action}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 text-center group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{method.title}</h3>
                                    <p className="text-slate-600 text-sm">{method.description}</p>
                                </motion.a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
                        <p className="text-slate-600 mb-8">
                            Fill out the form below and we'll get back to you within 24 hours
                        </p>

                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                <p className="text-slate-600 mb-6">
                                    Thank you for contacting us. We'll respond to your inquiry soon.
                                </p>
                                <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        type="text"
                                        placeholder="How can we help you?"
                                        value={formData.subject}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        rows={6}
                                        placeholder="Tell us more about your inquiry..."
                                        value={formData.message}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            Send Message <Send className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Link */}
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-slate-600 mb-4">
                            Looking for quick answers? Check out our{' '}
                            <a href="/#faq" className="text-blue-600 font-medium hover:underline">
                                Frequently Asked Questions
                            </a>
                        </p>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
