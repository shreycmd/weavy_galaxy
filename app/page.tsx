import { redirect } from "next/navigation";
import React from "react";

const page = () => {
  return redirect("/workflows");
};

export default page;
