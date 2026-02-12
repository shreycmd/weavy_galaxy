import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function SyncUser() {
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

  redirect("/");
}

// import { db } from "@/lib/db";
// import { auth, clerkClient } from "@clerk/nextjs/server";
// import { notFound, redirect } from "next/navigation";

// const SyncUser = async () => {
//   const { userId } = await auth();
//   if (!userId) {
//     throw new Error("User not found");
//   }
//   const Client = await clerkClient();
//   const user = await Client.users.getUser(userId);
//   if (!user.emailAddresses[0]?.emailAddress) {
//     return notFound();
//   }
//   await db.user.upsert({
//     where: { emailAddress: user.emailAddresses[0]?.emailAddress ?? " " },
//     update: {
//       imageUrl: user.imageUrl,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     },
//     create: {
//       id: userId,
//       emailAddress: user.emailAddresses[0]?.emailAddress ?? " ",
//       imageUrl: user.imageUrl,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     },
//   });
//   return redirect("/canvas");
// };

// export default SyncUser;
