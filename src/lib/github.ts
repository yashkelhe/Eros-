import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummeriseCommit } from "./gemini";
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// const githublink = "https://github.com/docker/genai-stack";

// from this u will git  what is inside the commit only change the commitHash
// https://github.com/Owner/repo/commit/[commitHash].diff
type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// git the all the commits
export const getCommitHashes = async (
  githubUrl: String,
): Promise<Response[]> => {
  // https://github.com/Owner/repo

  // from the back of the  URL we got two things owner and repo
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid github Url");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  // sort in the descending order if b is greater then it will give u the positive else negative
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[]; //any data type

  // take the first 15 commits
  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitMessage: commit.commit.message ?? " ",
    commitHash: commit.sha as string,
    commitAuthorName: commit.commit?.author?.name ?? " ",
    commitAuthorAvatar: commit?.author?.avatar_url ?? " ",
    commitDate: commit.commit?.author?.date,
  }));
};

// console.log(await getCommitHashes(githublink));

// to get the unprocessCommit

export const pollCommits = async (projectId: string) => {
  // take the URL
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

  // take the Commits from URL
  const commitHashes = await getCommitHashes(githubUrl);

  // get only those commit which are not merge
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  // take the summary of all
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    }),
  );

  // take each summary each commit as string
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });
  // console.log("this is the summary  of all ", summaries);

  // and then store it in the database
  const commit = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      // console.log(`processign commits : ${index}`);
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,

        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary,
      };
    }),
  });
  // console.log(unprocessedCommits);
  // console.log("data is stored in db");

  // console.log("Result of createMany:", commit);
  return commit;
};

// to summarise the commits
async function summariseCommit(githubUrl: string, commitHash: string) {
  // get the diff, then pass to the ai
  try {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
      headers: {
        // this is the github coustom formating
        Accept: "application/vnd.github.v3.diff",
      },
    });
    // pass the data to the ai
    // console.log("the data is passed to the Ai ");
    return aiSummeriseCommit(data) || "";
  } catch (error) {
    console.error(`Error summarizing commit ${commitHash}:`, error);
    return "";
  }
}

// fetch the url  from the project id
async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github Url ");
  }

  // find the github Url and object
  return { project, githubUrl: project?.githubUrl };
}

const filterUnprocessedCommits = async (
  projectId: string,
  commitHashes: Response[],
) => {
  const processedCommit = await db.commit.findMany({
    where: { projectId },
  });

  const unprocessedCommit = commitHashes.filter(
    (commit) =>
      !processedCommit.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommit;
};

// await pollCommits("cm54a783s0000u787rg1sa719").then(console.log);
