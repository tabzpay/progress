/**
 * useWizard - Multi-step wizard navigation hook
 * Manages step state, validation, and navigation
 */

import { useState, useCallback } from 'react';

interface UseWizardOptions {
    totalSteps: number;
    onStepChange?: (step: number) => void;
    validateStep?: (step: number) => Promise<boolean>;
}

export function useWizard(options: UseWizardOptions) {
    const { totalSteps, onStepChange, validateStep } = options;

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0); // For animations: 1 = forward, -1 = backward
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Navigate to specific step
    const goToStep = useCallback(
        (step: number) => {
            if (step < 1 || step > totalSteps) return;

            setDirection(step > currentStep ? 1 : -1);
            setCurrentStep(step);
            onStepChange?.(step);
        },
        [currentStep, totalSteps, onStepChange]
    );

    // Go to next step with validation
    const nextStep = useCallback(async () => {
        if (currentStep >= totalSteps) return false;

        // Validate current step if validator provided
        if (validateStep) {
            const isValid = await validateStep(currentStep);
            if (!isValid) return false;
        }

        // Mark current step as completed
        setCompletedSteps(prev => new Set(prev).add(currentStep));

        // Move to next step
        goToStep(currentStep + 1);
        return true;
    }, [currentStep, totalSteps, validateStep, goToStep]);

    // Go to previous step
    const previousStep = useCallback(() => {
        if (currentStep <= 1) return;
        goToStep(currentStep - 1);
    }, [currentStep, goToStep]);

    // Reset wizard
    const reset = useCallback(() => {
        setCurrentStep(1);
        setDirection(0);
        setCompletedSteps(new Set());
    }, []);

    // Check if step is completed
    const isStepCompleted = useCallback(
        (step: number) => {
            return completedSteps.has(step);
        },
        [completedSteps]
    );

    // Check if on first/last step
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    // Progress percentage
    const progress = (currentStep / totalSteps) * 100;

    return {
        // Current state
        currentStep,
        direction,
        progress,

        // Checks
        isFirstStep,
        isLastStep,
        isStepCompleted,

        // Navigation
        nextStep,
        previousStep,
        goToStep,
        reset,

        // Step tracking
        completedSteps: Array.from(completedSteps),
    };
}
