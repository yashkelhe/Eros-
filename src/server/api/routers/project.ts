import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubrepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    // in ctx u will put the database and the input in the input
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        },
      });

      if (!user) {
        throw new Error("User Not found");
      }

      const currentCredits = user.credits || 0;
      const fileCount = await checkCredits(input.githubUrl, input.githubToken);

      if (currentCredits < fileCount) {
        throw new Error("Insufficient credits");
      }
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          // here we are creating the project so userId for the relationship we use
          userToProjects: {
            create: {
              userId: ctx.user.userId!, //always user will not get null also so (!)
            },
          },
        },
      });

      // take the commits with summary after creating the project
      await indexGithubrepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
      await ctx.db.user.update({
        where: {
          id: ctx.user.userId!,
        },
        data: {
          credits: {
            decrement: fileCount,
          },
        },
      });
      return project;
    }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // and also again check is there have any new commits if yes then summarise and store it in DB
      pollCommits(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
    }),

  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReference: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.error("the input is : - ", input.fileReference);
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          projectId: input.projectId,
          question: input.question,
          fileReference: input.fileReference,
          userId: ctx.user.userId!, // take from the context
        },
      });
    }),

  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        // like most recent question first so we use desc
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getProjectsOfUser: protectedProcedure.query(async ({ ctx }) => {
    // console.log("[Backend] projectRouter call");
    // Ensure the userId is defined in the context
    if (!ctx.user?.userId) {
      throw new Error("User ID is not defined");
    }
    // console.log(":", ctx.user?.userId);

    try {
      // Fetch all projects associated with the user
      const projects = await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId,
            },
          },
          deletedAt: null, // Exclude deleted projects
        },
        include: {
          userToProjects: {
            include: {
              user: true, // Include user information if needed
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Sort by most recent projects first
        },
      });
      // console.log("the result is here: - ", projects);
      return projects;
    } catch (error) {
      console.error("Error fetching projects for user:", error);
      throw new Error("Failed to fetch projects for the user");
    }
  }),

  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          meetingUrl: input.meetingUrl,
          projectId: input.projectId,
          name: input.name,
          status: "PROCESSING",
        },
      });

      return meeting;
    }),

  getMeetings: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          issues: true,
        },
      });
    }),

  deleteMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),

  getMeetingById: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findUnique({
        where: {
          id: input.meetingId,
        },
        include: {
          issues: true,
        },
      });
    }),

  archiveProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),

  // give all the user of the particular project
  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
      });
    }),

  getMayCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        id: ctx.user.userId!,
      },

      // which field we want to select
      select: {
        credits: true,
      },
    });
  }),

  checkCredits: protectedProcedure
    .input(
      z.object({
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fileCount = await checkCredits(input.githubUrl, input.githubToken);
      // hole object
      const userCredits = await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        },
      });
      // how much credits does required and how much credits user have
      return { fileCount, userCredits: userCredits?.credits || 0 };
    }),
});
