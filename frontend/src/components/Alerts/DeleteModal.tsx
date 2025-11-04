import React, { Dispatch, SetStateAction } from "react";

import CustomAlertDialog from "./DialogAlert/CustomAlertDialog";

interface IDeleteModalProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  onCancel?: () => void;
  alertMessage?: any;
}

const DeleteModal: React.FC<IDeleteModalProps> = ({
  onConfirm,
  onCancel = () => {},
  isModalOpen,
  setIsModalOpen,
  alertMessage = (
    <>
      פעולה זו אינה ניתנת לביטול.<br></br> פעולה זו תמחק את המוצר לצמיתות ותסיר את נתוניו מהשרתים
      שלנו.<br></br>האם אתה בטוח שאתה רוצה להמשיך?
    </>
  ),
}) => {
  return (
    <CustomAlertDialog
      alertDialogProps={{ open: isModalOpen, onOpenChange: setIsModalOpen }}
      alertDialogContentProps={{
        children: alertMessage,
      }}
      alertDialogCancelProps={{
        onClick: () => {
          onCancel();
          setIsModalOpen(false);
        },
        children: "בטל",
        "data-testid": "dialog-cancel",
      }}
      alertDialogActionProps={{
        onClick: () => {
          onConfirm();
          setIsModalOpen(false);
        },
        children: "אשר",
        "data-testid": "dialog-confirm",
      }}
    />
  );
};

export default DeleteModal;
