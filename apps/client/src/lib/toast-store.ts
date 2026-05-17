import { create } from "zustand";

export type ToastTone = "success" | "error" | "danger";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  items: ToastItem[];
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  showToast(message, tone = "success") {
    const id = crypto.randomUUID();

    set((state) => ({
      items: [...state.items, { id, message, tone }],
    }));

    window.setTimeout(() => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    }, tone === "error" ? 2800 : 2000);
  },
  dismissToast(id) {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
