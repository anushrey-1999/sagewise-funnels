"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FormProgressContextType {
  currentStep: number;
  totalSteps: number;
  progress: number;
  setCurrentStep: (step: number) => void;
  setTotalSteps: (steps: number) => void;
}

const FormProgressContext = createContext<FormProgressContextType | undefined>(undefined);

export function FormProgressProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(1);
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <FormProgressContext.Provider
      value={{
        currentStep,
        totalSteps,
        progress,
        setCurrentStep,
        setTotalSteps,
      }}
    >
      {children}
    </FormProgressContext.Provider>
  );
}

export function useFormProgress() {
  const context = useContext(FormProgressContext);
  if (!context) {
    throw new Error("useFormProgress must be used within FormProgressProvider");
  }
  return context;
}

