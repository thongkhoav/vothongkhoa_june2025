// useStore.js
import type { User } from "@/utils/types/user.type";
import { create } from "zustand";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<UserState>((set) => ({
  user: {
    sub: "",
    email: "",
    fullName: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    tokens: {
      accessToken: "",
      refreshToken: "",
    },
  },
  setUser: (user: User) => set({ user }),
  logout: () =>
    set({
      user: null,
    }),
}));

export default useAuthStore;
