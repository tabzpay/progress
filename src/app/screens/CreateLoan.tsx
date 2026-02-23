import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookmarkPlus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { SuccessOverlay } from '../components/shared/SuccessOverlay';
import { ShareOverlay } from '../components/shared/ShareOverlay';
import { TemplateManager } from '../components/features/loans/TemplateManager';
import { useAuth } from '../../lib/contexts/AuthContext';
import { toast } from 'sonner';

// Custom hooks
import { useLoanForm } from '../../lib/hooks/useLoanForm';
import { useWizard } from '../../lib/hooks/useWizard';
import { usePaymentPlan } from '../../lib/hooks/usePaymentPlan';
import { useLoanTemplates } from '../../lib/hooks/useLoanTemplates';
import { useLoanGroups } from '../../lib/hooks/useLoanGroups';
import { useLoanSubmit } from '../../lib/hooks/useLoanSubmit';

// Step components
import {
  LoanTypeStep,
  BorrowerStep,
  FinancialTermsStep,
  PaymentPlanStep,
  ReviewStep,
} from '../components/features/loans/steps';

// Types
import type { Customer } from '../../lib/types/customer';
import { useState, useEffect } from 'react';

const TOTAL_STEPS = 5;

export function CreateLoan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ====================
  // HOOKS
  // ====================

  // Form management
  const loanForm = useLoanForm();

  // Wizard navigation
  const wizard = useWizard({
    totalSteps: TOTAL_STEPS,
    validateStep: loanForm.validateStep,
  });

  // Payment plan (installments, tax, payment terms)
  const paymentPlan = usePaymentPlan({
    loanType: loanForm.loanType,
    amount: loanForm.amount,
    onDueDateChange: (date) => loanForm.setValue('due_date', date),
  });

  // Templates
  const templates = useLoanTemplates(user?.id || '');

  // Groups (for group loans)
  const groups = useLoanGroups(user?.id || '', loanForm.loanType === 'group');

  // Submission
  const submit = useLoanSubmit();

  // ====================
  // LOCAL STATE
  // ====================

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // ====================
  // AUTO-SAVE DRAFT
  // ====================

  const allValues = loanForm.watch();

  useEffect(() => {
    if (!user) return;

    // Save draft every 3 seconds
    const timer = setTimeout(() => {
      const draft = {
        formData: allValues,
        bankName,
        accountName,
        accountNumber,
        selectedGroupId: groups.selectedGroupId,
        step: wizard.currentStep,
      };
      localStorage.setItem(`loan_draft_${user.id}`, JSON.stringify(draft));
    }, 3000);

    return () => clearTimeout(timer);
  }, [allValues, bankName, accountName, accountNumber, groups.selectedGroupId, wizard.currentStep, user]);

  // ====================
  // RESTORE DRAFT
  // ====================

  useEffect(() => {
    if (!user) return;

    const savedDraft = localStorage.getItem(`loan_draft_${user.id}`);
    if (savedDraft) {
      try {
        const { formData, bankName: bName, accountName: aName, accountNumber: aNum, selectedGroupId: sId, step: sStep } = JSON.parse(savedDraft);

        if (formData) {
          Object.entries(formData).forEach(([key, value]) => {
            loanForm.setValue(key as any, value);
          });
        }

        if (bName) setBankName(bName);
        if (aName) setAccountName(aName);
        if (aNum) setAccountNumber(aNum);
        if (sId) groups.setSelectedGroupId(sId);
        if (sStep) wizard.goToStep(sStep);

        toast.info('Progress restored from draft', {
          description: "We've loaded your last unsaved loan record.",
          duration: 4000,
        });
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }

    // Handle ?borrower=Name query parameter
    const params = new URLSearchParams(window.location.search);
    const borrowerName = params.get('borrower');
    if (borrowerName) {
      loanForm.setValue('borrower_name', decodeURIComponent(borrowerName));
    }
  }, [user]);

  // ====================
  // HANDLERS
  // ====================

  const handleBack = () => {
    if (wizard.isFirstStep) {
      navigate('/dashboard');
    } else {
      wizard.previousStep();
    }
  };

  const handleNext = async () => {
    // Additional validation for group loans
    if (wizard.currentStep === 2 && loanForm.loanType === 'group' && !groups.selectedGroupId) {
      toast.error('Please select a group for this loan');
      return;
    }

    // Proceed to next step
    await wizard.nextStep();
  };

  const handleSubmit = async () => {
    const success = await submit.submitLoan({
      formData: loanForm.form.getValues(),
      userId: user!.id,
      customerId: selectedCustomer?.id,
      groupId: groups.selectedGroupId || undefined,
      paymentPlan: paymentPlan.paymentPlan,
      taxRate: paymentPlan.taxRate,
      taxAmount: paymentPlan.taxAmount,
      bankDetails: {
        bankName,
        accountName,
        accountNumber,
      },
    });

    if (success) {
      // Clear draft
      localStorage.removeItem(`loan_draft_${user!.id}`);

      // Reset wizard
      wizard.reset();
    }
  };

  const handleSaveTemplate = () => {
    templates.saveTemplate({
      type: loanForm.loanType,
      currency: loanForm.currency,
      amount: loanForm.amount,
      note: loanForm.note,
      payment_terms: paymentPlan.paymentTerms,
      tax_rate: paymentPlan.taxRate,
    });
  };

  // ====================
  // RENDER
  // ====================

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 pb-36 md:pb-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{wizard.isFirstStep ? 'Back to Dashboard' : 'Previous Step'}</span>
        </button>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Loan</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => templates.setIsTemplateManagerOpen(true)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => templates.setShowSaveTemplate(true)}
                className="gap-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const stepNum = i + 1;
              const isActive = wizard.currentStep === stepNum;
              const isCompleted = wizard.isStepCompleted(stepNum);

              return (
                <div key={stepNum} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${isCompleted
                      ? 'bg-green-500'
                      : isActive
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Step {wizard.currentStep} of {TOTAL_STEPS}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={wizard.currentStep}
            initial={{ opacity: 0, x: wizard.direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: wizard.direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            {/* Step 1: Loan Type */}
            {wizard.currentStep === 1 && (
              <LoanTypeStep
                selectedType={loanForm.loanType}
                onTypeChange={(type) => loanForm.setValue('type', type)}
              />
            )}

            {/* Step 2: Borrower */}
            {wizard.currentStep === 2 && (
              <BorrowerStep
                loanType={loanForm.loanType}
                borrowerName={loanForm.borrowerName}
                onBorrowerNameChange={(name) => loanForm.setValue('borrower_name', name)}
                selectedCustomer={selectedCustomer}
                onCustomerChange={(customer) => {
                  setSelectedCustomer(customer);
                  loanForm.setCustomerData(customer);
                }}
                groups={groups.groups}
                selectedGroupId={groups.selectedGroupId}
                onGroupChange={(groupId) => {
                  groups.setSelectedGroupId(groupId);
                  const group = groups.groups.find((g) => g.id === groupId);
                  if (group) {
                    loanForm.setValue('borrower_name', group.name);
                  }
                }}
                errors={loanForm.errors}
              />
            )}

            {/* Step 3: Financial Terms */}
            {wizard.currentStep === 3 && (
              <FinancialTermsStep
                loanType={loanForm.loanType}
                amount={loanForm.amount}
                onAmountChange={(amount) => loanForm.setValue('amount', amount)}
                currency={loanForm.currency}
                onCurrencyChange={(currency) => loanForm.setValue('currency', currency)}
                dueDate={loanForm.dueDate}
                onDueDateChange={(date) => loanForm.setValue('due_date', date)}
                paymentTerms={paymentPlan.paymentTerms}
                onPaymentTermsChange={paymentPlan.setPaymentTerms}
                taxRate={paymentPlan.taxRate}
                onTaxRateChange={paymentPlan.setTaxRate}
                errors={loanForm.errors}
              />
            )}

            {/* Step 4: Payment Plan */}
            {wizard.currentStep === 4 && (
              <PaymentPlanStep
                amount={loanForm.amount}
                currency={loanForm.currency}
                dueDate={loanForm.dueDate}
                repaymentSchedule={paymentPlan.repaymentSchedule}
                onRepaymentScheduleChange={paymentPlan.setRepaymentSchedule}
                paymentPlan={paymentPlan.paymentPlan}
                onPaymentPlanChange={paymentPlan.setPaymentPlan}
              />
            )}

            {/* Step 5: Review */}
            {wizard.currentStep === 5 && (
              <ReviewStep
                loanType={loanForm.loanType}
                borrowerName={loanForm.borrowerName}
                amount={loanForm.amount}
                currency={loanForm.currency}
                dueDate={loanForm.dueDate}
                note={loanForm.note}
                onNoteChange={(note) => loanForm.setValue('note', note)}
                paymentTerms={paymentPlan.paymentTerms}
                taxRate={paymentPlan.taxRate}
                taxAmount={paymentPlan.taxAmount}
                repaymentSchedule={paymentPlan.repaymentSchedule}
                paymentPlan={paymentPlan.paymentPlan}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky bottom action bar — always visible above mobile bottom nav */}
      {/* Fixed action bar on mobile/tablet (below lg) — sits above the BottomNav */}
      <div className="fixed bottom-20 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={submit.isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {wizard.isFirstStep ? 'Cancel' : 'Back'}
          </Button>

          {wizard.isLastStep ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => submit.submitLoan({
                  formData: loanForm.watch(),
                  userId: user?.id || '',
                  customerId: selectedCustomer?.id,
                  groupId: groups.selectedGroupId,
                  paymentPlan: paymentPlan.paymentPlan,
                  taxRate: paymentPlan.taxRate,
                  taxAmount: paymentPlan.taxAmount,
                  bankDetails: { bankName, accountName, accountNumber },
                  status: 'PENDING'
                })}
                disabled={submit.isSubmitting}
                className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              >
                <Sparkles className="w-4 h-4" />
                Send as Offer
              </Button>
              <Button onClick={handleSubmit} disabled={submit.isSubmitting} className="gap-2">
                {submit.isSubmitting ? 'Creating...' : 'Create Loan'}
              </Button>
            </div>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Inline action bar for desktop (lg+) */}
      <div className="hidden lg:block max-w-4xl mx-auto mt-6">
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={submit.isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {wizard.isFirstStep ? 'Cancel' : 'Back'}
          </Button>

          {wizard.isLastStep ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => submit.submitLoan({
                  formData: loanForm.watch(),
                  userId: user?.id || '',
                  customerId: selectedCustomer?.id,
                  groupId: groups.selectedGroupId,
                  paymentPlan: paymentPlan.paymentPlan,
                  taxRate: paymentPlan.taxRate,
                  taxAmount: paymentPlan.taxAmount,
                  bankDetails: { bankName, accountName, accountNumber },
                  status: 'PENDING'
                })}
                disabled={submit.isSubmitting}
                className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              >
                <Sparkles className="w-4 h-4" />
                Send as Offer
              </Button>
              <Button onClick={handleSubmit} disabled={submit.isSubmitting} className="gap-2">
                {submit.isSubmitting ? 'Creating...' : 'Create Loan'}
              </Button>
            </div>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <SuccessOverlay isOpen={submit.isSuccessOpen} onClose={() => submit.setIsSuccessOpen(false)} />

      <ShareOverlay
        isOpen={submit.isShareOpen}
        onClose={() => submit.setIsShareOpen(false)}
        shareUrl={submit.shareUrl}
      />

      <TemplateManager
        isOpen={templates.isTemplateManagerOpen}
        onClose={() => templates.setIsTemplateManagerOpen(false)}
        onLoadTemplate={(template) => {
          templates.loadTemplate(template, (data) => {
            if (data.type) loanForm.setValue('type', data.type);
            if (data.currency) loanForm.setValue('currency', data.currency);
            if (data.amount) loanForm.setValue('amount', data.amount);
            if (data.note) loanForm.setValue('note', data.note);
            if (data.payment_terms) paymentPlan.setPaymentTerms(data.payment_terms as any);
            if (data.tax_rate) paymentPlan.setTaxRate(data.tax_rate);
          });
        }}
      />

      {/* Save Template Dialog */}
      {
        templates.showSaveTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
              <input
                type="text"
                value={templates.templateName}
                onChange={(e) => templates.setTemplateName(e.target.value)}
                placeholder="Template name"
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => templates.setShowSaveTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={templates.isSavingTemplate}>
                  {templates.isSavingTemplate ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
