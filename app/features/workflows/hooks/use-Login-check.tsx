import { LoginModal } from "@/app/_components/LoginModel";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";

export const usePerformSignin = () => {
  const [open, setopen] = useState(false);
  const handleError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      if (error.data?.code === "UNAUTHORIZED") setopen(true);
      return true;
    }
    return false;
  };
  const modal = <LoginModal open={open} onopenChange={setopen} />;
  return { handleError, modal };
};
