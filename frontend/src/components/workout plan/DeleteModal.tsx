import React, { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import CustomAlertDialog from "../Alerts/DialogAlert/CustomAlertDialog";

interface IDeleteModalProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  onCancel?: () => void;
}

const DeleteModal: React.FC<IDeleteModalProps> = ({
  onConfirm,
  onCancel = () => {},
  isModalOpen,
  setIsModalOpen,
}) => {
  return (
    <CustomAlertDialog
      alertDialogProps={{ open: isModalOpen, onOpenChange: setIsModalOpen }}
      alertDialogContentProps={{
        children: (
          <>
            פעולה זו אינה ניתנת לביטול.<br></br> פעולה זו תמחק את המוצר לצמיתות ותסיר את נתוניו
            מהשרתים שלנו.<br></br>האם אתה בטוח שאתה רוצה להמשיך?
          </>
        ),
      }}
      alertDialogCancelProps={{
        onClick: () => {
          onCancel();
          setIsModalOpen(false);
        },
        children: "בטל",
      }}
      alertDialogActionProps={{
        onClick: () => {
          onConfirm();
          setIsModalOpen(false);
        },
        children: "אשר",
      }}
    />
  );
};

export default DeleteModal;
