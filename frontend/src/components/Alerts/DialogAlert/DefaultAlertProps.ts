import {
  AlertDialogProps,
  AlertDialogContentProps,
  AlertDialogTitleProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
} from "@radix-ui/react-alert-dialog";

const defaultAlertDialogProps: AlertDialogProps = {
  open: false,
  onOpenChange: () => {},
};

const defaultAlertDialogContentProps: AlertDialogContentProps = {
  // Add any default content props if needed
};

const defaultAlertDialogHeaderProps: React.HTMLAttributes<HTMLDivElement> = {
  // Add any default header props if needed
};

const defaultAlertDialogTitleProps: AlertDialogTitleProps = {
  children: "האם אתה בטוח?",
};

const defaultAlertDialogFooterProps: React.HTMLAttributes<HTMLDivElement> = {
  // Add any default footer props if needed
};

const defaultAlertDialogCancelProps: AlertDialogCancelProps = {
  onClick: () => {},
  children: "בטל",
};

const defaultAlertDialogActionProps: AlertDialogActionProps = {
  onClick: () => {},
  children: "אשר",
};

export {
  defaultAlertDialogProps,
  defaultAlertDialogContentProps,
  defaultAlertDialogHeaderProps,
  defaultAlertDialogTitleProps,
  defaultAlertDialogFooterProps,
  defaultAlertDialogCancelProps,
  defaultAlertDialogActionProps,
};
