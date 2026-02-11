import { useState } from "react";
import { ArrowLeft, User, Phone, Mail, Camera, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { SuccessOverlay } from "../components/SuccessOverlay";
import { cn } from "../components/ui/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, type ProfileFormData } from "../../lib/schemas";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../lib/contexts/AuthContext";

export function EditProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            email: "",
        },
    });

    const full_name = watch("full_name");
    const email = watch("email");

    useEffect(() => {
        if (user) {
            reset({
                full_name: user.user_metadata?.full_name || "",
                phone: user.phone || "",
                email: user.email || "",
            });
        }
        setIsLoading(false);
    }, [user, reset]);

    const handleSave = async (data: ProfileFormData) => {
        setIsSaving(true);
        try {
            if (!user) throw new Error("No user session");

            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: data.full_name }
            });
            if (authError) throw authError;

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: data.full_name
                });
            if (profileError) throw profileError;

            setIsSuccessOpen(true);
        } catch (error: any) {
            toast.error(error.message || "Error updating profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Premium Header - Consistent Theme */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-[60px]"
                    />
                </div>

                <div className="max-w-xl mx-auto relative z-10 text-white">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 rounded-full h-10 w-10 border border-white/20 backdrop-blur-sm shrink-0"
                            onClick={() => navigate("/profile")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Edit Profile</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                                Personal Information
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-xl mx-auto px-6 -mt-6 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Avatar Section */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 shadow-lg overflow-hidden">
                                <div className="w-full h-full rounded-[calc(1.5rem-2px)] bg-white flex items-center justify-center font-black text-3xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-600">
                                    {full_name?.charAt(0) || "U"}
                                </div>
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6">
                            Tap to change photo
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[11px] uppercase font-black tracking-widest text-slate-400 ml-1">Display Name</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="full_name"
                                    type="text"
                                    placeholder="Your full name"
                                    {...register("full_name")}
                                    className={cn(
                                        "pl-11 h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold",
                                        errors.full_name && "border-red-500 bg-red-50/10"
                                    )}
                                />
                            </div>
                            {errors.full_name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">{errors.full_name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[11px] uppercase font-black tracking-widest text-slate-400 ml-1">Phone Number</Label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    {...register("phone")}
                                    className={cn(
                                        "pl-11 h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-primary/20 focus:border-primary/20 rounded-2xl transition-all font-bold tabular-nums",
                                        errors.phone && "border-red-500 bg-red-50/10"
                                    )}
                                />
                            </div>
                            {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase font-black tracking-widest text-slate-400 ml-1 opacity-50">Email Address (Read-only)</Label>
                            <div className="relative opacity-50">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    disabled
                                    value={email || "No email provided"}
                                    className="pl-11 h-14 bg-slate-50 border-transparent rounded-2xl font-bold cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-16 rounded-3xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                            onClick={() => navigate("/profile")}
                        >
                            <X className="w-5 h-5 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] h-16 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleSubmit(handleSave)}
                            disabled={isSaving || isLoading}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </motion.div>
            </main>

            <SuccessOverlay
                isOpen={isSuccessOpen}
                onClose={() => navigate("/profile")}
                onAction={() => navigate("/profile")}
                title="Profile Updated!"
                message="Your account details have been successfully changed and saved."
                actionLabel="Back to Profile"
            />
        </div>
    );
}
