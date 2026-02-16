"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  open: boolean;
}
export const LoginModal = ({ open }: UpgradeModalProps) => {
  const router = useRouter();
  return (
    <AlertDialog
      open={open}
      onOpenChange={() => {
        console.log("tada");
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Please Sign in </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>CAncel</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push("/sigin")}>
            Sign In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
