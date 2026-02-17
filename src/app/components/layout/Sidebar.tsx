// Desktop Sidebar Navigation Component
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Building2, User, BarChart3, Users, LogOut, Menu, X, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { useState } from "react";
import { useAuth } from "../../../lib/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const pathname = location.pathname;
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
        },
        {
            label: "Customers",
            icon: Building2,
            path: "/customers",
            badge: "New",
        },
        {
            label: "Groups",
            icon: Users,
            path: "/groups",
        },
        {
            label: "Analytics",
            icon: BarChart3,
            path: "/analytics",
        },
    ];

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="hidden lg:flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-r border-border h-screen sticky top-0 transition-all duration-300"
        >
            {/* Logo & Brand */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-black text-lg tracking-tight">Progress</h1>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Lending Platform</p>
                            </div>
                        </motion.div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="rounded-xl h-9 w-9 hover:bg-accent"
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* User Info */}
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-4 border-b border-border"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center font-black text-white text-sm">
                            {displayName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", isActive && "stroke-[2.5px]")} />
                            {!isCollapsed && (
                                <>
                                    <span className="text-sm font-bold flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}

                {/* Create Loan Action Button */}
                <Button
                    onClick={() => navigate("/create-loan")}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg rounded-xl h-12 gap-2"
                >
                    <PlusCircle className="w-5 h-5" />
                    {!isCollapsed && <span className="font-bold">Create Loan</span>}
                </Button>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border space-y-2">
                <Link
                    to="/profile"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        pathname === "/profile"
                            ? "bg-accent text-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <User className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-bold">Profile</span>}
                </Link>

                <Button
                    variant="ghost"
                    onClick={signOut}
                    className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
                </Button>
            </div>
        </motion.aside>
    );
}
