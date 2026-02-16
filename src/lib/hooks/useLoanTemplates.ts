/**
 * useLoanTemplates - Template management hook
 * Handles saving and loading loan templates
 */

import { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export interface LoanTemplate {
    id: string;
    user_id: string;
    name: string;
    type: 'personal' | 'business' | 'group';
    currency: string;
    amount?: number;
    due_date?: string;
    note?: string;
    // Business-specific
    payment_terms?: string;
    tax_rate?: number;
    created_at: string;
}

export function useLoanTemplates(userId: string) {
    const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');

    // Save current form as template
    const saveTemplate = async (templateData: Partial<LoanTemplate>) => {
        if (!templateName.trim()) {
            toast.error('Please enter a template name');
            return false;
        }

        setIsSavingTemplate(true);

        try {
            const { error } = await supabase
                .from('loan_templates')
                .insert({
                    user_id: userId,
                    name: templateName,
                    ...templateData,
                });

            if (error) throw error;

            toast.success('Template saved successfully');
            setTemplateName('');
            setShowSaveTemplate(false);
            return true;
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Failed to save template');
            return false;
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // Load and apply template
    const loadTemplate = (template: LoanTemplate, applyFn: (data: Partial<LoanTemplate>) => void) => {
        applyFn(template);
        toast.success(`Template "${template.name}" loaded`);
        setIsTemplateManagerOpen(false);
    };

    // Delete template
    const deleteTemplate = async (templateId: string) => {
        try {
            const { error } = await supabase
                .from('loan_templates')
                .delete()
                .eq('id', templateId)
                .eq('user_id', userId);

            if (error) throw error;

            toast.success('Template deleted');
            return true;
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error('Failed to delete template');
            return false;
        }
    };

    return {
        // Template manager modal
        isTemplateManagerOpen,
        setIsTemplateManagerOpen,
        openTemplateManager: () => setIsTemplateManagerOpen(true),
        closeTemplateManager: () => setIsTemplateManagerOpen(false),

        // Save template
        showSaveTemplate,
        setShowSaveTemplate,
        templateName,
        setTemplateName,
        isSavingTemplate,
        saveTemplate,

        // Load/delete templates
        loadTemplate,
        deleteTemplate,
    };
}
