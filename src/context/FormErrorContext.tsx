"use client";

import { createContext, useContext, type ReactNode } from "react";

type FormErrorContextType = {
  errors?: Record<string, string[]> | null;
};

const FormErrorContext = createContext<FormErrorContextType | undefined>(
  undefined
);

export function FormErrorProvider({
  children,
  errors,
}: {
  children: ReactNode;
  errors?: Record<string, string[]> | null;
}) {
  return (
    <FormErrorContext.Provider value={{ errors }}>
      {children}
    </FormErrorContext.Provider>
  );
}

export function useFormErrors() {
  const context = useContext(FormErrorContext);
  if (context === undefined) {
    throw new Error("useFormErrors must be used within a FormErrorProvider");
  }
  return context;
}

// Helper hook to get errors for a specific field
export function useFieldError(fieldName: string) {
  const { errors } = useFormErrors();
  return errors?.[fieldName]?.[0] || null;
}
