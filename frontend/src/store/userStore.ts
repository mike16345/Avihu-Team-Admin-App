import { SafeAuthUser } from "@/interfaces/IAuth";
import { IUser } from "@/interfaces/IUser";
import { create } from "zustand";

interface IUserStore {
  currentUser: SafeAuthUser | null;
  setCurrentUser: (user: SafeAuthUser | null) => void;
  users: IUser[];
  setUsers: (users: IUser[]) => void;
}

export const useUsersStore = create<IUserStore>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },
  users: [],
  setUsers: (users) => {
    set({ users: users });
  },
}));
