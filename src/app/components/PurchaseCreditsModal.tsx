import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Zap, ShieldCheck, Check } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { useState } from "react";
import { toast } from "sonner";

interface Package {
    id: string;
    credits: number;
    price: number;
    popular?: boolean;
}

const packages: Package[] = [
    { id: "starter", credits: 50, price: 4.99 },
    { id: "pro", credits: 250, price: 19.99, popular: true },
    { id: "growth", credits: 1000, price: 69.99 },
];

export function PurchaseCreditsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [selectedId, setSelectedId] = useState<string>("pro");
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePurchase = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        toast.success("SMS credits added to your account!");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden pointer-events-auto"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 -z-10">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                                />
                            </div>

                            <div className="px-8 pt-10 pb-12 relative z-10">
                                <div className="flex justify-between items-start mb-8 text-white">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">SMS Credits</h3>
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Global delivery</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {packages.map((pkg) => (
                                        <motion.button
                                            key={pkg.id}
                                            onClick={() => setSelectedId(pkg.id)}
                                            className={cn(
                                                "w-full p-4 rounded-3xl border text-left transition-all relative flex items-center justify-between",
                                                selectedId === pkg.id
                                                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                                            )}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                    selectedId === pkg.id ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                                                )}>
                                                    {selectedId === pkg.id && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <div>
                                                    <div className="text-[15px] font-bold text-slate-900">{pkg.credits} Credits</div>
                                                    <div className="text-xs font-semibold text-slate-400">${pkg.price} One-time</div>
                                                </div>
                                            </div>
                                            {pkg.popular && (
                                                <div className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                                                    Best Value
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="mt-10 space-y-4">
                                    <Button
                                        onClick={handlePurchase}
                                        disabled={isProcessing}
                                        className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5" />
                                                Purchase Credits
                                            </div>
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 text-slate-400">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-black tracking-widest">Secure Checkout Powered by Stripe</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
