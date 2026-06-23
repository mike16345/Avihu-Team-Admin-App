import React from "react";

import ConfirmationDialog from "./ConfirmationDialog";

interface IDeleteModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  alertMessage?: React.ReactNode;
}

const DeleteModal: React.FC<IDeleteModalProps> = ({
  onConfirm,
  onCancel = () => {},
  isModalOpen,
  setIsModalOpen,
  title = "למחוק את הפריט?",
  confirmLabel = "מחק",
  cancelLabel = "בטל",
  alertMessage = (
    <>
      פעולה זו אינה ניתנת לביטול.
      <br />
      הפריט יימחק לצמיתות ויוסר מהמערכת.
    </>
  ),
}) => {
  return (
    <ConfirmationDialog
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title={title}
      description={alertMessage}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant="destructive"
    />
  );
};

export default DeleteModal;
