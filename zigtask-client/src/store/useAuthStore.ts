// useStore.js
import type { User } from "@/utils/types/user.type";
import { create } from "zustand";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const useAuthStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
  logout: () =>
    set({
      user: null,
    }),
}));

export default useAuthStore;
