import { prisma } from "@/lib/db";

export default async function Home() {
  const users = await prisma.user.findMany();
  console.log(users);

  return (
    <div>
      {" "}
      <div className="text-red-100">weavy_clone</div>
    </div>
  );
}
