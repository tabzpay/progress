import { useState, useEffect } from "react";
import { ArrowLeft, BellRing, Settings, Save, Plus, Trash2, MessageSquare, Mail, Info, Play, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../lib/contexts/AuthContext";
import { processReminderSchedules } from "../../lib/reminderEngine";

export function ReminderSettings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // New Template Form
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateContent, setNewTemplateContent] = useState("");
    const [newTemplateType, setNewTemplateType] = useState<"email" | "sms" | "whatsapp">("whatsapp");

    useEffect(() => {
        fetchTemplates();
    }, []);

    async function fetchTemplates() {
        try {
            const { data, error } = await supabase
                .from('reminder_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error: any) {
            console.error("Error fetching templates:", error);
            toast.error("Failed to load templates");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddTemplate() {
        if (!newTemplateName || !newTemplateContent) {
            toast.error("Please fill in both name and content");
            return;
        }

        setIsSaving(true);
        try {
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('reminder_templates')
                .insert([{
                    user_id: user.id,
                    name: newTemplateName,
                    content: newTemplateContent,
                    type: newTemplateType
                }]);

            if (error) throw error;

            toast.success("Template created successfully");
            setNewTemplateName("");
            setNewTemplateContent("");
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteTemplate(id: string) {
        try {
            const { error } = await supabase
                .from('reminder_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Template deleted");
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function handleRunEngine() {
        setIsTesting(true);
        try {
            const results: any = await processReminderSchedules();
            if (results && results.length > 0) {
                toast.success(`Processed ${results.length} reminders! Check console for logs.`);
            } else {
                toast.info("Scan complete. No reminders were due today.");
            }
        } catch (error: any) {
            toast.error("Engine scan failed");
        } finally {
            setIsTesting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Header */}
            <header className="relative pt-8 pb-12 px-4 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                </div>

                <div className="max-w-2xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm"
                            onClick={() => navigate("/dashboard")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Reminder Settings</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                                Automate your communications
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
                {/* Engine Debug Card */}
                <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Play className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Test Reminder Engine</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manually trigger a scan of all active schedules.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleRunEngine}
                            disabled={isTesting}
                            className="rounded-xl bg-slate-900 px-6 font-bold"
                        >
                            {isTesting ? "Scanning..." : "Run Now"}
                        </Button>
                    </div>
                </div>

                {/* Add New Template */}
                <div className="bg-white border border-slate-200/60 rounded-[3rem] p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Create Template</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Template Name</Label>
                            <Input
                                placeholder="e.g., Friendly Nudge"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-500 shadow-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Channel</Label>
                            <div className="flex gap-2">
                                {(['whatsapp', 'email', 'sms'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setNewTemplateType(type)}
                                        className={cn(
                                            "flex-1 h-12 rounded-xl text-xs font-bold transition-all border shrink-0",
                                            newTemplateType === type
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                                                : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300"
                                        )}
                                    >
                                        {type === 'whatsapp' && "WhatsApp"}
                                        {type === 'email' && "Email"}
                                        {type === 'sms' && "SMS"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-1">Message Content</Label>
                            <Textarea
                                placeholder="Type your message... Use {{amount}}, {{borrower}}, {{due_date}}"
                                value={newTemplateContent}
                                onChange={(e) => setNewTemplateContent(e.target.value)}
                                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-indigo-500 shadow-none text-sm p-4"
                            />
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                            onClick={handleAddTemplate}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Template"}
                        </Button>
                    </div>
                </div>

                {/* Templates List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 ml-4">Your Templates</h3>
                    <div className="grid gap-4">
                        {templates.map((tpl) => (
                            <motion.div
                                key={tpl.id}
                                layout
                                className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm flex items-start justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                            {tpl.type}
                                        </div>
                                        <h4 className="font-bold text-slate-900">{tpl.name}</h4>
                                    </div>
                                    <p className="text-sm text-slate-500 italic leading-relaxed">"{tpl.content}"</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteTemplate(tpl.id)}
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-900 uppercase tracking-tighter mb-1">Power Tip</p>
                        <p className="text-xs font-medium text-indigo-800/80 leading-relaxed">
                            Use variables like <span className="font-bold font-mono">{"{{amount}}"}</span> to automatically insert loan details into your messages.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
