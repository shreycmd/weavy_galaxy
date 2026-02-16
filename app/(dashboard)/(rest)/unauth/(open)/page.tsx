"use client";
import { LoginModal } from "@/app/_components/LoginModel";
import React, { useState } from "react";
interface Pageprops {
  params: Promise<{ credentialId: string }>;
}
const page = async ({ params }: Pageprops) => {
  const { open } = await params;
  const [op, setop] = useState();
  return <LoginModal open={open} onopenChange={setopen} />;
};

export default page;
