import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import { cn } from "../../ui/utils";

interface FileUploaderProps {
    bucketName: string;
    onUploadComplete: (path: string, file: File) => void;
    maxSizeMB?: number;
    acceptedFileTypes?: Record<string, string[]>;
    folder?: string;
}

export function FileUploader({
    bucketName,
    onUploadComplete,
    maxSizeMB = 5,
    acceptedFileTypes = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
    },
    folder
}: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File too large. Max size is ${maxSizeMB}MB.`);
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = folder ? `${folder}/${fileName}` : fileName;

            const { error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            setProgress(100);
            toast.success("File uploaded successfully");
            onUploadComplete(filePath, file);

        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast.error(error.message || "Error uploading file");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [bucketName, maxSizeMB, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: acceptedFileTypes,
        maxSize: maxSizeMB * 1024 * 1024
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ease-in-out cursor-pointer group overflow-hidden",
                    isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50",
                    isDragReject && "border-rose-500 bg-rose-50/50",
                    uploading && "pointer-events-none opacity-80"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                        isDragActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400",
                        isDragReject && "bg-rose-100 text-rose-600"
                    )}>
                        {uploading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Upload className="w-6 h-6" />
                            </motion.div>
                        ) : isDragReject ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Upload className="w-6 h-6" />
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                        {uploading ? "Uploading..." : isDragActive ? "Drop it here!" : "Click to upload or drag & drop"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-[200px]">
                        SVG, PNG, JPG or PDF (max. {maxSizeMB}MB)
                    </p>
                </div>

                {/* Progress Bar */}
                {uploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-indigo-600"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
