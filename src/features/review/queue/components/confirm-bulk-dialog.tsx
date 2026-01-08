import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmBulkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "approve" | "reject";
  count: number;
  onConfirm: () => void;
}

export function ConfirmBulkDialog({
  open,
  onOpenChange,
  action,
  count,
  onConfirm,
}: ConfirmBulkDialogProps) {
  const title =
    action === "approve" ? "Approve selected items?" : "Reject selected items?";
  const description =
    action === "approve"
      ? `This will mark ${count} ${count === 1 ? "item" : "items"} as Approved.`
      : `This will mark ${count} ${count === 1 ? "item" : "items"} as Rejected.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
