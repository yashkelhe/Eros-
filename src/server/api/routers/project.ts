import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubrepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    // in ctx u will get the database and the input in the input
    .mutation(async ({ ctx, input }) => {
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
      return project;
    }),
  getAllProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        // get the all the projects that a user  have based on the userId
        userToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },

        // if its deleted then dont show
        deletedAt: null,
      },
    });
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
});
