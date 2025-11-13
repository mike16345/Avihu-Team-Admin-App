import type { Lead } from "@/interfaces/leads";
import CustomButton from "../ui/CustomButton";
import DeleteModal from "../Alerts/DeleteModal";
import { useState } from "react";

interface DeleteLeadAlertProps {
  lead: Lead;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
}

const DeleteLeadAlert = ({ lead, onConfirm, disabled }: DeleteLeadAlertProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        onConfirm={() => onConfirm()}
        setIsModalOpen={setIsDeleteModalOpen}
        // alertMessage={"למחוק ליד זה?"}

        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <CustomButton
        onClick={() => setIsDeleteModalOpen(true)}
        title="מחק"
        isLoading={disabled}
        size={"lg"}
        variant="destructive"
        data-testid={`lead-delete-${lead._id}`}
      />
    </>
  );
};

export default DeleteLeadAlert;
