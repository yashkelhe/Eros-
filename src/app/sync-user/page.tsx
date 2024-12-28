import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { notFound, redirect } from "next/navigation";

const SyncUser = async () => {
  // take the id
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  //   create client
  const client = await clerkClient();
  //   it will provide us all the info all the client
  const user = await client.users.getUser(userId);
  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound();
  }

  //   if user is clreated then update or else create new user
  await db.user.upsert({
    // if email found the update part will run and if not then create part
    where: {
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return redirect("/dashboard");
};

export default SyncUser;
