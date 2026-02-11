import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Plus, Calendar, DollarSign, BellRing, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../components/ui/utils";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../lib/contexts/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function GroupDetail() {
    const { user } = useAuth();
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<any>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [isAddingMember, setIsAddingMember] = useState(false);
    const userId = user?.id;

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    async function fetchGroupDetails() {
        try {
            if (!user) return;
            if (!groupId) return;

            // Fetch Group Info & Members
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*, group_members(*, profiles(*))') // Join profiles to get names/avatars
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;
            setGroup(groupData);
            setMembers(groupData.group_members || []);

            // Fetch Loans linked to this group
            const { data: loansData, error: loansError } = await supabase
                .from('loans')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: false });

            if (loansError) throw loansError;
            setLoans(loansData || []);

        } catch (error) {
            console.error("Error fetching group details:", error);
            toast.error("Failed to load group details");
            navigate("/groups");
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) return;
        setIsAddingMember(true);
        try {
            // 1. Find user by email (Note: This requires a secure RPC or Edge Function in prod, 
            // but for now we might need to rely on exact match if we can't search users table directly from client.
            // Alternatively, we just invite by creating a pending member record if we had that system.
            // For this MVP, we will try to find a profile with that email if RLS allows, or just fail for now.)

            // REALITY CHECK: Client cannot query auth.users. 
            // We will look up in `public.profiles` IF email is exposed there (it is in our schema).
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', newMemberEmail)
                .single();

            if (profileError || !profile) {
                toast.error("User not found via email. They must sign up first.");
                return;
            }

            // 2. Add to group_members
            const { error: addError } = await supabase
                .from('group_members')
                .insert([{
                    group_id: groupId,
                    user_id: profile.id,
                    role: 'member'
                }]);

            if (addError) throw addError;

            toast.success("Member added successfully!");
            setNewMemberEmail("");
            setIsAddMemberOpen(false);
            fetchGroupDetails();

        } catch (error: any) {
            console.error("Error adding member:", error);
            toast.error(error.message || "Failed to add member");
        } finally {
            setIsAddingMember(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!group) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Premium Header */}
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
                            onClick={() => navigate("/groups")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">{group.name}</h1>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                                {members.length} Members • {loans.length} Active Records
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
                {/* Members Section (Horizontal Scroll) */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Members</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 uppercase tracking-wider"
                            onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                    </div>

                    <AnimatePresence>
                        {isAddMemberOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-4 overflow-hidden"
                            >
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter member email..."
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        className="h-10 bg-slate-50 border-slate-200"
                                    />
                                    <Button
                                        className="h-10 bg-slate-900 text-white"
                                        onClick={handleAddMember}
                                        disabled={isAddingMember}
                                    >
                                        {isAddingMember ? "..." : "Invite"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {members.map((member: any) => (
                            <div key={member.id} className="flex flex-col items-center gap-2 min-w-[64px]">
                                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                    {member.profiles?.avatar_url ? (
                                        <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-black text-slate-400">
                                            {member.profiles?.full_name?.charAt(0) || "?"}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 text-center truncate w-full">
                                    {member.user_id === userId ? "You" : (member.profiles?.full_name?.split(' ')[0] || "User")}
                                </span>
                                {member.role === 'admin' && (
                                    <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase">
                                        Admin
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loans List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Group Loans</h3>
                    {loans.length > 0 ? (
                        loans.map((loan) => (
                            <motion.div
                                key={loan.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => navigate(`/loan/${loan.id}`)}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center",
                                            loan.lender_id === userId ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                        )}>
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">
                                            {loan.lender_id === userId ? "You Lent" : "You Borrowed"}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider",
                                        loan.status === 'PAID' ? "bg-emerald-100 text-emerald-700" :
                                            loan.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                                "bg-slate-100 text-slate-600"
                                    )}>
                                        {loan.status}
                                    </span>
                                </div>

                                <div className="flex items-baseline justify-between">
                                    <h4 className="text-lg font-black text-slate-900 truncate pr-4">
                                        {loan.lender_id === userId ? `To ${loan.borrower_name}` : `From ${members.find((m: any) => m.user_id === loan.lender_id)?.profiles?.full_name || "Lender"}`}
                                    </h4>
                                    <span className="text-xl font-black text-indigo-600 tabular-nums">
                                        {loan.currency} {loan.amount}
                                    </span>
                                </div>

                                {loan.due_date && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(loan.due_date).toLocaleDateString()}
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <EmptyState
                            icon={DollarSign}
                            title="No Group Records Yet"
                            description="Create a loan and select this group to start tracking shared expenses."
                            actionLabel="Create Loan"
                            onAction={() => navigate("/create-loan")}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
