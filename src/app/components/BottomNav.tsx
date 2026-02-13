import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Users, User, BarChart3, Building2 } from "lucide-react";
import { cn } from "./ui/utils";

export function BottomNav() {
    const location = useLocation();
    const pathname = location.pathname;

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
        },
        {
            label: "Add",
            icon: PlusCircle,
            path: "/create-loan",
            isAction: true,
        },
        {
            label: "Analytics",
            icon: BarChart3,
            path: "/analytics",
        },
        {
            label: "Profile",
            icon: User,
            path: "/profile",
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-2">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl shadow-2xl shadow-black/10 flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    if (item.isAction) {
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative -top-6 flex items-center justify-center"
                            >
                                <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                                    <Icon className="w-6 h-6" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-90",
                                isActive
                                    ? "text-primary bg-primary/5 font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
