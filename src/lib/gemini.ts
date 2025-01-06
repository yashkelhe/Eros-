const { GoogleGenerativeAI } = require("@google/generative-ai");
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiSummeriseCommit = async (diff: string) => {
  //https://github.com/owner/repo/commit/<CommitHash>.diff
  try {
    const response = await model.generateContent([
      "You are an expert programmer, and you are trying to summarize a git diff. Reminders about the git diff format: For every file, there are a few metadata lines, like (for example):",
      `
    diff --git a/lib/index.js b/lib/index.js
    index aadf691..bfef603 100644
    --- a/lib/index.js
    +++ b/lib/index.js
    `,
      'This means that "lib/index.js" was modified in this commit. Note that this is only an example. Then there is a specifier of the lines that were modified. A line starting with "+" means it was added. A line that starts with "-" means that line was deleted. A line that starts with neither "+" nor "-" is code given for context and better understanding. It is not part of the diff.',

      "EXAMPLE SUMMARY COMMENTS:",
      `
    * Raised the amount of returned recordings from "10" to "100" [packages/server/recordings_api.ts], [packages/server/constants.ts]
    * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
    * Moved the "octokit" initialization to a separate file [src/octokit.ts], [src/index.ts]
    * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
    * Lowered numeric tolerance for test files
    `,
      "Most commits will have less comments than this examples list. The last comment does not include the file names, because there were more than two relevant files in the hypothetical commit. Do not include parts of the example in your summary.",
      "Please summarize the following diff file:",
      diff,
    ]);

    return response.response.text();
  } catch (error) {
    console.error("Error summarizing commit:", error);
    return ""; // Return an empty string on error.
  }
};

// console.log(
//   await aiSummeriseCommit(
//     `—-- a/prisma/schema.prisma
// +++ b/prisma/schema.prisma
// @@ -13,8 +13,8 @@ datasource db {
// model User {
// id String @id @default(cuid())
// emailAddress String @unique
// - firstName String
// - lastName String
// + firstName String?
// + lastName String?
// imageUrl String?
// stripeSubscriptionId String? @unique
// }`,
//   ),
// );

export const summariseCode = async (docs: Document) => {
  console.log("getting summary for : ", docs.metadata.source);
  try {
    const code = docs.pageContent.slice(0, 10000); //limit to 10000 characters file content
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.
    You are onboarding a junior software engineer and explaining to them the purpose of the ${docs.metadata.source} file.

    Here is the code:
    ${code}
    Give a summary no more than 100 words of the code above.
    `,
    ]);

    console.log("summary is created for embedding ");
    return response.response.text();
  } catch (error) {
    return " ";
  }
};

// and gemini also provide to generate the embedding
export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(summary);
  const embedding = result.embedding;
  // array Of number
  return embedding.values;
}

// console.log(
//   await aiSummeriseCommit(
//     ` await aiSummeriseCommit(—-- a/prisma/schema.prisma +++ b/prisma/schema.prisma @@ -13,8 +13,8 @@ datasource db {model User {  `,
//   ),
// );
