import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

const Canvas = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/signin");

  const user = await currentUser();

  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) return notFound();

  await db.user.upsert({
    where: { id: userId },
    update: {
      emailAddress: email,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      emailAddress: email,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return <div>Canvas</div>;
};

export default Canvas;
