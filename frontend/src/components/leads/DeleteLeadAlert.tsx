import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/interfaces/leads";

interface DeleteLeadAlertProps {
  lead: Lead;
  onConfirm?: () => Promise<void> | void;
  disabled?: boolean;
}

const DeleteLeadAlert = ({ lead, onConfirm, disabled }: DeleteLeadAlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" data-testid={`lead-delete-${lead._id}`}>
          מחק
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>למחוק ליד זה?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>בטל</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm?.()} disabled={disabled}>
            מחק
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLeadAlert;
