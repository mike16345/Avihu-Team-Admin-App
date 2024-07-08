import { IUser } from "@/interfaces/IUser";
import { create } from "zustand";

interface IUserStore {
  users: IUser[];
  setUsers: (users: IUser[]) => void;
}

export const useAreasStore = create<IUserStore>((set, get) => ({
  users: [],
  setUsers: (users) => {
    set({ users: users });
  },
}));
