import { ArrowLeft, Users, Plus, ChevronRight, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../components/ui/utils";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('groups')
        .select('*, group_members(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load your groups");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // 1. Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name: newGroupName,
          created_by: user.id
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      toast.success("Group created successfully!");
      setIsCreateModalOpen(false);
      setNewGroupName("");
      fetchGroups();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasGroups = groups.length > 0;

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Premium Header - Matching Dashboard/CreateLoan */}
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
              <h1 className="text-2xl font-black tracking-tight">Your Groups</h1>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">
                Collaborative Records
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
        {hasGroups ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {groups.map((group) => (
              <motion.div
                key={group.id}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-indigo-900/5 overflow-hidden relative group"
              >
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Users className="w-32 h-32" />
                </div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">{group.name}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex -space-x-2">
                        {group.group_members?.slice(0, 3).map((m: any, i: number) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {m.user_id === userId ? "Y" : "M"}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {group.group_members?.length || 0} Members
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                    onClick={() => toast.info("Detailed group view coming soon")}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3 relative z-10">
                  {group.group_members?.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                          {member.user_id === userId ? "YOU" : member.role.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{member.user_id === userId ? "You" : "Group Member"}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{member.role}</div>
                        </div>
                      </div>
                      <div className={cn(
                        "text-sm font-black tabular-nums",
                        member.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {member.balance >= 0 ? "+" : ""}${Number(member.balance).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-6 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  onClick={() => toast.info("Settlements coming in next update")}
                >
                  View Full Settlements
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Users}
            title="Isolated Economy?"
            description="Groups help you track shared food, rent, or collaborative projects effortlessly."
            actionLabel="Create First Group"
            onAction={() => setIsCreateModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Action Bar */}
      {hasGroups && (
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
          <div className="max-w-xl mx-auto flex justify-end">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="rounded-2xl w-16 h-16 shadow-2xl shadow-primary/40 bg-indigo-600 hover:bg-indigo-700 transition-all border border-white/20"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-8 h-8" />
              </Button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Create Group Modal Overlay */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Create New Group</h2>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Connect multiple ledgers into one shared space.
              </p>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black tracking-widest text-slate-400 ml-1">Group Title</Label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Housemates, Trip to Bali"
                    className="h-14 bg-slate-50 border-transparent rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-bold"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
