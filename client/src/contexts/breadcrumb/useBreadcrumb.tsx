import { create } from "zustand";

interface BreadcrumbState {
  labels: Record<string, string>;
  setLabel: (id: string, label: string) => void;
}

export const useBreadcrumb = create<BreadcrumbState>((set) => ({
  labels: {},
  setLabel: (id, label) =>
    set((state) => {
      if (state.labels[id] === label) return state;
      return {
        labels: { ...state.labels, [id]: label },
      };
    }),
}));
