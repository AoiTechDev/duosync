import { create } from "zustand";

export const useChat = create<{
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
}));
