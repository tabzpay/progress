import { ArrowLeft, User, Phone, Bell, Globe, CreditCard, LogOut, ChevronRight, Settings, ShieldCheck, HelpCircle, Info, Moon, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { cn } from "../components/ui/utils";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { ConfirmModal } from "../components/ConfirmModal";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { PurchaseCreditsModal } from "../components/PurchaseCreditsModal";
import { analytics, identifyUser } from "../../lib/analytics";
import { useAuth } from "../../lib/contexts/AuthContext";
import { VerificationPrompt } from "../components/VerificationPrompt";
import { checkVerificationStatus, syncEmailVerification, type VerificationStatus } from "../../lib/verification";

export function Profile() {
  const { user, signOut: logOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isVerified: false,
    emailVerified: false,
    phoneVerified: false,
    emailVerifiedAt: null,
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      // Identify user in analytics
      identifyUser(user!.id, {
        email: user!.email,
        phone: user!.phone,
      });

      // Sync email verification status from auth.users
      await syncEmailVerification(user!.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (!error) {
        setProfile(data);
        // Check verification status
        const status = checkVerificationStatus(data);
        setVerificationStatus(status);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success("Signed out successfully");
      navigate("/sign-in");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          [key]: value,
          full_name: user.user_metadata?.full_name || profile?.full_name
        });

      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, [key]: value }));
      toast.success("Preference updated");
    } catch (error: any) {
      console.error("Error updating preference:", error);
      toast.error("Failed to update preference");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const accountSettings = [
    {
      icon: Phone,
      label: "Phone / Email",
      value: user?.email || user?.phone || "No contact info",
      color: "bg-blue-100 text-blue-600",
      action: () => navigate("/profile/edit"),
    },
    {
      icon: CreditCard,
      label: "SMS Credits",
      value: "45 remaining",
      color: "bg-amber-100 text-amber-600",
      action: () => setIsPurchaseModalOpen(true),
    },
    {
      icon: Moon,
      label: "Theme",
      value: "Light / Dark mode",
      color: "bg-purple-100 text-purple-600",
      action: undefined, // Handled by ThemeToggle
      isToggle: true,
    },
    {
      icon: Globe,
      label: "Language",
      value: "English",
      color: "bg-indigo-100 text-indigo-600",
      action: () => toast.info("Language settings coming soon! We will support French, Spanish, and Arabic in the next release."),
    },
  ];

  const appSettings = [
    {
      icon: Briefcase,
      label: "Occupation",
      value: profile?.occupation || "Not set",
      color: "bg-slate-100 text-slate-600",
      action: () => navigate("/profile/edit"),
    },
    {
      icon: ShieldCheck,
      label: "Privacy & Security",
      value: "Policy & Terms",
      color: "bg-emerald-100 text-emerald-600",
      action: () => navigate("/privacy"),
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      value: "Guides & FAQs",
      color: "bg-violet-100 text-violet-600",
      action: () => navigate("/help"),
    },
  ];

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
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Settings</h1>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                Account & Preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Account Card (Glassmorphism) */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <User className="w-32 h-32" />
            </div>

            <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-[calc(1.5rem-2px)] bg-white flex items-center justify-center font-black text-2xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-600">
                  {profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{profile?.full_name || user?.user_metadata?.full_name || "Progress User"}</h2>
                <p className="text-slate-400 font-bold tabular-nums text-sm mt-0.5 tracking-wide">
                  {user?.email || user?.phone}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {verificationStatus.isVerified && (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                      Verified Member
                    </div>
                  )}
                  {profile?.onboarding_intent && (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                      Goal: {profile.onboarding_intent === 'lend' ? 'Lending' : profile.onboarding_intent === 'borrow' ? 'Borrowing' : 'Exploring'}
                    </div>
                  )}
                  {profile?.currency && (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                      Currency: {profile.currency}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              onClick={() => navigate("/profile/edit")}
            >
              Edit Profile Detail
            </Button>
          </motion.div>

          {/* Verification Prompt for Unverified Users */}
          {!verificationStatus.isVerified && (
            <motion.div variants={itemVariants}>
              <VerificationPrompt
                status={verificationStatus}
                onResendEmail={() => toast.info("Email verification link resent! Check your inbox.")}
                onVerifyPhone={() => toast.info("Phone verification coming soon! For now, contact support to verify your phone.")}
              />
            </motion.div>
          )}

          {/* Section: General */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 ml-4">General</h3>
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
              {accountSettings.map((item, idx) => (
                item.isToggle ? (
                  <div
                    key={idx}
                    className="w-full p-5 flex items-center gap-4 border-b border-slate-100 last:border-0"
                  >
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-sm", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-slate-900">{item.label}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5">{item.value}</div>
                    </div>
                    <ThemeToggle />
                  </div>
                ) : (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0 group"
                  >
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-active:scale-95 shadow-sm", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold text-slate-900">{item.label}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5">{item.value}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                )
              ))}
            </div>
          </motion.div>

          {/* Section: Notifications (Glassmorphism Toggle Panel) */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 ml-4">Communication</h3>
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              {[
                { label: "Repayment Reminders", desc: "Alerts for upcoming due dates", icon: Bell, key: 'reminders_enabled' },
                { label: "SMS Confirmation", desc: "Confirm recorded payments", icon: Phone, key: 'sms_confirmations_enabled' },
                { label: "New Records", desc: "Alerts for new loan requests", icon: User, key: 'new_records_enabled' },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <pref.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900">{pref.label}</div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5 tracking-tight">{pref.desc}</div>
                    </div>
                  </div>
                  <Switch
                    checked={profile ? profile[pref.key] : true}
                    onCheckedChange={(checked) => handlePreferenceChange(pref.key, checked)}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section: App Preferences */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 ml-4">Support & Transparency</h3>
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
              {appSettings.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0 group"
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-active:scale-95 shadow-sm", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-slate-900">{item.label}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">{item.value}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.div variants={itemVariants} className="pt-4">
            <Button
              variant="outline"
              className="w-full h-16 rounded-3xl text-rose-600 border-rose-100 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-200 font-bold transition-all shadow-sm"
              onClick={() => setShowSignOutModal(true)}
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0" />
              Sign Out of Session
            </Button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
              © 2026 Progress App • Built for Clarity
            </p>
          </motion.div>
        </motion.div>
      </main>

      <ConfirmModal
        isOpen={showSignOutModal}
        onOpenChange={setShowSignOutModal}
        onConfirm={handleSignOut}
        title="Sign Out?"
        description="Are you sure you want to end your current session? You'll need to sign in again to access your records."
        confirmText="Sign Out"
        variant="danger"
        icon={LogOut}
      />

      <PurchaseCreditsModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
}
