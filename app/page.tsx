import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // const users = await prisma.user.findMany();
  // console.log(users);

  return redirect("/canvas");
}
