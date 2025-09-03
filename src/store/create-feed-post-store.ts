import { create } from "zustand";

interface FormState {
  errors: Record<string, string[]> | null;
  setErrors: (errors: Record<string, string[]> | null) => void;
  getFieldError: (field: string) => string | null;
}

export const useFormStore = create<FormState>((set, get) => ({
  errors: null,
  setErrors: (errors) => set({ errors }),
  getFieldError: (field: string) => {
    const errors = get().errors;
    return errors?.[field]?.[0] || null;
  },
}));
