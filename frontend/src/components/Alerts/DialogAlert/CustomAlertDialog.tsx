import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogContentProps,
  AlertDialogProps,
  AlertDialogTitleProps,
} from "@radix-ui/react-alert-dialog";
import {
  defaultAlertDialogActionProps,
  defaultAlertDialogCancelProps,
  defaultAlertDialogContentProps,
  defaultAlertDialogFooterProps,
  defaultAlertDialogHeaderProps,
  defaultAlertDialogProps,
  defaultAlertDialogTitleProps,
} from "./DefaultAlertProps";
import { cn } from "@/lib/utils";

interface CustomAlertDialogProps {
  alertDialogProps: AlertDialogProps;
  alertDialogContentProps?: AlertDialogContentProps;
  alertDialogHeaderProps?: React.HTMLAttributes<HTMLDivElement>;
  alertDialogTitleProps?: AlertDialogTitleProps;
  alertDialogFooterProps?: React.HTMLAttributes<HTMLDivElement>;
  alertDialogCancelProps?: AlertDialogCancelProps;
  alertDialogActionProps?: AlertDialogActionProps;
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  alertDialogProps = defaultAlertDialogProps,
  alertDialogHeaderProps = defaultAlertDialogHeaderProps,
  alertDialogTitleProps = defaultAlertDialogTitleProps,
  alertDialogContentProps = defaultAlertDialogContentProps,
  alertDialogActionProps = defaultAlertDialogActionProps,
  alertDialogCancelProps = defaultAlertDialogCancelProps,
  alertDialogFooterProps = defaultAlertDialogFooterProps,
}) => {
  return (
    <AlertDialog {...alertDialogProps}>
      <AlertDialogContent aria-describedby="dsdfg" {...alertDialogContentProps}>
        <AlertDialogHeader {...alertDialogHeaderProps}>
          <AlertDialogTitle
            {...alertDialogTitleProps}
            className={cn("text-right", alertDialogTitleProps?.className)}
          />
        </AlertDialogHeader>

        {alertDialogContentProps.children}

        <AlertDialogFooter
          {...alertDialogFooterProps}
          className={cn("gap-2", alertDialogFooterProps?.className)}
        >
          <AlertDialogCancel {...alertDialogCancelProps} />
          <AlertDialogAction {...alertDialogActionProps} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
