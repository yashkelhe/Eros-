import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
// it will take the github Url and gives us how many files are in the repo
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

// this is the recursive function which counts the number of the files in the repo
const getFileCount = async (
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  acc: number = 0,
) => {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });

  // if there is not array means there is only one file
  if (!Array.isArray(data) && data.type === "file") {
    return acc + 1;
  }

  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];
    for (const items of data) {
      if (items.type === "dir") {
        // to put in the array to get the dir file > recursive
        directories.push(items.path);
      } else {
        fileCount++;
      }
    }

    // if still there is another dir then
    if (directories.length > 0) {
      const directoryCount = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, octokit, githubOwner, githubRepo, 0),
        ),
      );

      fileCount += directoryCount.reduce((acc, count) => acc + count, 0);
    }

    return acc + fileCount;
  }

  return acc;
};
export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  // find out how mmany files in the repo
  const octokit = new Octokit({ auth: githubToken });

  // of the Url 3 owner and 4 repo name
  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];

  if (!githubOwner || !githubRepo) {
    return 0;
  }

  const fileCount = await getFileCount("", octokit, githubOwner, githubRepo, 0);

  return fileCount;
};

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  // it allow to load the file of the repo

  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_TOKEN,
    // accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    // to get each and every folder file
    recursive: true,
    // worn the binary files, PDF and so on
    unknown: "warn",
    maxConcurrency: 5, // Limit concurrency for requests
  });

  const docs = await loader.load(); // Load repository files
  return docs;
};

// Example usage
// (async () => {
//   try {
// const files = await loadGithubRepo(
//   "https://github.com/elliott-chong/chatpdf-yt",

//   //   process.env.GITHUB_TOKEN, // Replace with a valid token
//      );
// console.log(files);
//   } catch (error) {
//     console.error("Error loading GitHub repository:", error);
//   }
// })();

// console.log(
//   await loadGithubRepo("https://github.com/elliott-chong/chatpdf-yt"),
// );

// format and many more
// Document {
//     pageContent: "import { neon, neonConfig } from \"@neondatabase/serverless\";\nimport { drizzle } from \"drizzle-orm/neon-http\";\n\nneonConfig.fetchConnectionCache = true;\n\nif (!process.env.DATABASE_URL) {\n  throw new Error(\"database url not found\");\n}\n\nconst sql = neon(process.env.DATABASE_URL);\n\nexport const db = drizzle(sql);\n",
//     metadata: {
//       source: "src/lib/db/index.ts",
//       repository: "https://github.com/elliott-chong/chatpdf-yt",
//       branch: "main",
//},

export const indexGithubrepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  // get the all  files
  const docs = await loadGithubRepo(githubUrl, githubToken);
  // get all embedding/vector
  const allEmbeddings = await generateEmbeddings(docs);
  // take each one embedde
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      // console.log(`processing  ${index} of ${allEmbeddings.length}`);
      if (!embedding) {
        return;
      }
      // store to db model sourceCodeEmbedding but the actual vector cant put in the prisma directly, its not supported by prisma, we have to write  actual  query to insert
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "SummaryEmbedding" = ${embedding.embedding}::vector 
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

// it takes list file and generate the Ai summary of files and then
// from the summary it will generate the  Vector Embedding
export const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      // take the summary
      const summary = await summariseCode(doc);
      // generate the vector
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
