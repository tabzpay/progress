import { useState, useEffect } from "react";
import { FileText, Download, Trash2, Eye, StickyNote, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "motion/react";

interface Document {
    id: string;
    file_path: string;
    file_type: string;
    file_size: number;
    category: string;
    created_at: string;
    uploader_id: string;
}

interface DocumentListProps {
    loanId: string;
    currentUserId: string;
    refreshTrigger: number; // Prop to trigger refetch
}

export function DocumentList({ loanId, currentUserId, refreshTrigger }: DocumentListProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, [loanId, refreshTrigger]);

    async function fetchDocuments() {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('loan_id', loanId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            // Don't toast here to avoid spamming if table doesn't exist yet
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = async (doc: Document) => {
        try {
            const { data, error } = await supabase.storage
                .from('loan-documents') // Ensure this matches bucket name
                .createSignedUrl(doc.file_path, 60); // 1 minute expiry

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (error: any) {
            toast.error("Failed to download file");
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('loan-documents')
                .remove([doc.file_path]);

            if (storageError) throw storageError;

            // 2. Delete from Database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            if (dbError) throw dbError;

            toast.success("Document deleted");
            setDocuments(prev => prev.filter(d => d.id !== doc.id));
        } catch (error: any) {
            toast.error("Failed to delete document");
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
        return <StickyNote className="w-5 h-5 text-indigo-500" />;
    };

    if (loading) return <div className="text-center text-sm text-slate-400 py-4">Loading documents...</div>;

    if (documents.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No documents attached yet</p>
                <p className="text-xs text-slate-400 mt-1">Upload agreements, receipts, or IDs</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {documents.map((doc) => (
                    <motion.div
                        key={doc.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                {getIcon(doc.file_type)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {new Date(doc.created_at).toLocaleDateString()} • {formatSize(doc.file_size)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(doc)}
                                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                title="View/Download"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>

                            {doc.uploader_id === currentUserId && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(doc)}
                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
