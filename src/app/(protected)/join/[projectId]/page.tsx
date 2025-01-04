import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type props = {
  params: Promise<{ projectId: string }>;
};
const JoinHandler = async (props: props) => {
  // tale the projectId from the url
  const { projectId } = await props.params;
  const { userId } = await auth();

  if (!userId) return redirect("/sign-in");

  // get the user
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    // include: { projects: true },
  });

  // create the user if they don't exist
  const client = await clerkClient();
  // take the all the information of the user
  const user = await client.users.getUser(userId);

  // if the user doesn't exist in the database, create them
  // take the new user info and link the project to that user
  if (!dbUser) {
    await db.user.create({
      data: {
        id: userId,
        emailAddress: user.emailAddresses[0]!.emailAddress,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return redirect("/dashboard");
  }

  try {
    await db.userToProject.create({
      data: {
        userId: userId,
        projectId: projectId,
      },
    });
  } catch (e) {
    console.log("user already in the project");
  }
  return redirect(`/dashboard`);
};

export default JoinHandler;
