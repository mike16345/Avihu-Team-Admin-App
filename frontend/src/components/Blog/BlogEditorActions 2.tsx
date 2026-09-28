import React from "react";
import DeleteModal from "../Alerts/DeleteModal";
import { FaTrash } from "react-icons/fa6";

const getSaveButtonLabel = (isSaving: boolean, isEdit: boolean) => {
  if (isSaving) return "שומר…";
  if (isEdit) return "שמור שינויים";
  return "פרסם מאמר";
};

type BlogEditorActionsProps = {
  isEdit: boolean;
  isSaving: boolean;
  isSaveDisabled: boolean;
  isDeleteModalOpen: boolean;
  onDeleteClick: () => void;
  onDeleteModalOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
};

const BlogEditorActions: React.FC<BlogEditorActionsProps> = ({
  isEdit,
  isSaving,
  isSaveDisabled,
  isDeleteModalOpen,
  onDeleteClick,
  onDeleteModalOpenChange,
  onConfirmDelete,
  onCancelDelete,
  onCancel,
  onSave,
}) => (
  <div className="sticky bottom-0 z-10 mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-end">
    {isEdit && (
      <>
        <button
          type="button"
          onClick={onDeleteClick}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
        >
          <FaTrash size={11} />
          מחק מאמר
        </button>
        <DeleteModal
          isModalOpen={isDeleteModalOpen}
          setIsModalOpen={onDeleteModalOpenChange}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      </>
    )}

    <button
      type="button"
      onClick={onCancel}
      disabled={isSaving}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
    >
      ביטול
    </button>

    <button
      type="button"
      onClick={onSave}
      disabled={isSaveDisabled || isSaving}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
    >
      {getSaveButtonLabel(isSaving, isEdit)}
    </button>
  </div>
);

export default BlogEditorActions;
