import { deleteItem, fetchData, sendData } from "@/API/api";
import { IProgressNote, IProgressNotes } from "@/interfaces/IProgress";
import { ApiResponse } from "@/types/types";

const PROGRESS_NOTE_ENDPOINT = `progressNote`;

export const useProgressNotesApi = () => {
  const getProgressNotesByUserId = async (userId: string) =>
    await fetchData<ApiResponse<IProgressNotes>>(`${PROGRESS_NOTE_ENDPOINT}/one`, { userId });

  const addProgressNote = async (note: IProgressNote & { userId: string }) =>
    await sendData<ApiResponse<IProgressNotes>>(`${PROGRESS_NOTE_ENDPOINT}`, note);

  const deleteProgressNote = async (userId: string, noteId: string) =>
    await deleteItem<ApiResponse<void>>(`${PROGRESS_NOTE_ENDPOINT}`, { userId, noteId });

  return { getProgressNotesByUserId, addProgressNote, deleteProgressNote };
};
