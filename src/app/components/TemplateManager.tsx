import { useState, useEffect } from "react";
import { Trash2, Plus, BookmarkPlus, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { cn } from "./ui/utils";
import { analytics } from "../../lib/analytics";

interface LoanTemplate {
    id: string;
    name: string;
    loan_type: 'personal' | 'business' | 'group';
    currency?: string;
    default_amount?: number;
    bank_name?: string;
    account_name?: string;
    notes?: string;
    created_at: string;
}

interface TemplateManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: LoanTemplate) => void;
}

export function TemplateManager({ isOpen, onClose, onSelectTemplate }: TemplateManagerProps) {
    const [templates, setTemplates] = useState<LoanTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('loan_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error: any) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            const { error } = await supabase
                .from('loan_templates')
                .delete()
                .eq('id', templateId);

            if (error) throw error;

            setTemplates(prev => prev.filter(t => t.id !== templateId));
            toast.success('Template deleted');
        } catch (error: any) {
            console.error('Error deleting template:', error);
            toast.error('Failed to delete template');
        }
    };

    const handleSelectTemplate = (template: LoanTemplate) => {
        analytics.templateUsed(template.name);
        onSelectTemplate(template);
        onClose();
    };

    const getLoanTypeColor = (type: string) => {
        switch (type) {
            case 'personal':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'business':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'group':
                return 'bg-violet-100 text-violet-700 border-violet-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <BookmarkPlus className="w-6 h-6 text-indigo-600" />
                        Loan Templates
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Quickly create loans using saved templates
                    </p>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            Loading templates...
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-600 mb-1">No templates yet</p>
                            <p className="text-xs text-slate-400">
                                Save a template from the loan creation screen
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                                >
                                    <button
                                        onClick={() => handleSelectTemplate(template)}
                                        className="w-full text-left"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                                    {template.name}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border",
                                                        getLoanTypeColor(template.loan_type)
                                                    )}>
                                                        {template.loan_type}
                                                    </span>
                                                    {template.currency && (
                                                        <span className="text-xs font-semibold text-slate-500">
                                                            {template.currency}
                                                        </span>
                                                    )}
                                                    {template.default_amount && (
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {new Intl.NumberFormat('en-US', {
                                                                style: 'currency',
                                                                currency: template.currency || 'USD',
                                                                minimumFractionDigits: 0,
                                                            }).format(template.default_amount)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {(template.bank_name || template.notes) && (
                                            <div className="space-y-1 text-xs text-slate-500">
                                                {template.bank_name && (
                                                    <p className="font-medium">
                                                        🏦 {template.bank_name}
                                                        {template.account_name && ` • ${template.account_name}`}
                                                    </p>
                                                )}
                                                {template.notes && (
                                                    <p className="line-clamp-1 italic">{template.notes}</p>
                                                )}
                                            </div>
                                        )}
                                    </button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete template "${template.name}"?`)) {
                                                handleDeleteTemplate(template.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
