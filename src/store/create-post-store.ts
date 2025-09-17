import { create } from "zustand";

interface FormState {
  errors: Record<string, string[]> | null;
  setErrors: (errors: Record<string, string[]> | null) => void;
  getFieldError: (field: string) => string | null;
  // Separate states for create and edit dialogs
  shouldOpenCreateDialog: boolean;
  setShouldOpenCreateDialog: (shouldOpenCreateDialog: boolean) => void;
  shouldOpenEditDialog: boolean;
  setShouldOpenEditDialog: (shouldOpenEditDialog: boolean) => void;
  postId: string | null;
  setPostId: (postId: string | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  errors: null,
  setErrors: (errors) => set({ errors }),
  getFieldError: (field: string) => {
    const errors = get().errors;
    return errors?.[field]?.[0] || null;
  },
  shouldOpenCreateDialog: false,
  setShouldOpenCreateDialog: (shouldOpenCreateDialog) => set({ shouldOpenCreateDialog }),
  shouldOpenEditDialog: false,
  setShouldOpenEditDialog: (shouldOpenEditDialog) => set({ shouldOpenEditDialog }),
  postId: null,
  setPostId: (postId) => set({ postId }),
  isEditing: false,
  setIsEditing: (isEditing) => set({ isEditing }),
}));
