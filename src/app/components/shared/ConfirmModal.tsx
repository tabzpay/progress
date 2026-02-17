import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from "../ui/utils";
import { AlertCircle, HelpCircle, Info, LogOut } from "lucide-react";

type ModalVariant = "danger" | "warning" | "info" | "question";

interface ConfirmModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    icon?: React.ElementType;
}

export function ConfirmModal({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info",
    icon: Icon,
}: ConfirmModalProps) {

    const variantStyles = {
        danger: {
            bg: "bg-rose-50 text-rose-600",
            btn: "bg-rose-600 hover:bg-rose-700 text-white",
            defaultIcon: AlertCircle
        },
        warning: {
            bg: "bg-amber-50 text-amber-600",
            btn: "bg-amber-600 hover:bg-amber-700 text-white",
            defaultIcon: AlertCircle
        },
        info: {
            bg: "bg-blue-50 text-blue-600",
            btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
            defaultIcon: Info
        },
        question: {
            bg: "bg-indigo-50 text-indigo-600",
            btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
            defaultIcon: HelpCircle
        }
    };

    const currentVariant = variantStyles[variant];
    const DisplayIcon = Icon || currentVariant.defaultIcon;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-[2.5rem] p-8 border-white/50 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
                {/* Background Accent */}
                <div className={cn(
                    "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10",
                    currentVariant.bg
                )} />

                <AlertDialogHeader className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3",
                        currentVariant.bg
                    )}>
                        <DisplayIcon className="w-8 h-8 transform -rotate-3" />
                    </div>
                    <div className="space-y-2">
                        <AlertDialogTitle className="text-2xl font-black tracking-tight text-slate-900 border-none p-0">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] font-medium text-slate-500 leading-relaxed px-2">
                            {description}
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="relative z-10 flex-row gap-3 mt-6">
                    <AlertDialogCancel className="flex-1 h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all border-none">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={cn(
                            "flex-[1.5] h-14 rounded-2xl font-black transition-all shadow-lg active:scale-95 border-none",
                            currentVariant.btn
                        )}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
