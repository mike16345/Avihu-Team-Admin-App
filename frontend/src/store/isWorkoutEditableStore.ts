import { create } from "zustand";

interface IisWorkoutEditable {
  isEditable: boolean;
  changeIsEditable: (isEditable: boolean) => void;
}

export const useIsWorkoutEditable = create<IisWorkoutEditable>((set) => {
  return {
    isEditable: false,
    changeIsEditable: (isEditable) => set({ isEditable: isEditable }),
  };
});
