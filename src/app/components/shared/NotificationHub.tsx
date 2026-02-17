import { motion, AnimatePresence } from "motion/react";
import { X, Bell, CheckCircle2, MessageSquare, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export interface Notification {
    id: string;
    type: "payment" | "notice" | "system";
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

interface NotificationHubProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

export function NotificationHub({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }: NotificationHubProps) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight">Notifications</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white hover:bg-white/10 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={notif.id}
                                        onClick={() => !notif.is_read && onMarkAsRead(notif.id)}
                                        className={cn(
                                            "p-4 rounded-[1.5rem] border transition-all flex gap-4 group cursor-pointer",
                                            notif.is_read ? "bg-white border-slate-100 opacity-60" : "bg-indigo-50/30 border-indigo-100 ring-1 ring-indigo-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                            notif.type === "payment" ? "bg-emerald-50 text-emerald-600" :
                                                notif.type === "notice" ? "bg-blue-50 text-blue-600" :
                                                    "bg-indigo-50 text-indigo-600"
                                        )}>
                                            {notif.type === "payment" ? <DollarSign className="w-5 h-5" /> :
                                                notif.type === "notice" ? <MessageSquare className="w-5 h-5" /> :
                                                    <CheckCircle2 className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{notif.type}</span>
                                                <span className="text-[10px] font-bold text-slate-300">{formatTime(notif.created_at)}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 mb-1">{notif.title}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">All caught up!</h3>
                                    <p className="text-sm text-slate-400 mt-1">No new notifications at the moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <Button
                                    onClick={onMarkAllAsRead}
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 group"
                                >
                                    Mark all as read
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
