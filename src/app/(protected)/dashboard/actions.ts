"use server";
import { Prisma } from "@prisma/client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API,
});
// console.log("Available methods:", Object.keys(google));

export async function askQuestion(question: string, projectId: string) {
  try {
    const queryVector = await generateEmbedding(question);
    console.log("queryVector:", queryVector);
    console.log("projectId:", projectId);

    if (
      !queryVector ||
      !Array.isArray(queryVector) ||
      queryVector.length === 0
    ) {
      throw new Error("queryVector is invalid or empty");
    }
    if (!projectId || typeof projectId !== "string") {
      throw new Error("projectId is invalid");
    }
    const result = await db.$queryRaw<
      { fileName: string; sourceCode: string; summary: string }[]
    >(
      Prisma.sql`
  SELECT "fileName", "sourceCode", "summary",
         1 - ("SummaryEmbedding" <=> CAST(${queryVector} AS vector)) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE "SummaryEmbedding" IS NOT NULL
    AND 1 - ("SummaryEmbedding" <=> CAST(${queryVector} AS vector)) >=0.5
    AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `,
    );

    // if (!result || result.length === 0) {
    //   console.warn("No results found for the query");
    //   return { answer: null, filesReferences: [] };
    // }
    let context = "";

    for (const doc of result) {
      context += `source: ${doc.fileName} \ncode content: ${doc.sourceCode} \nsummary of file: ${doc.summary}\n\n`;
    }
    // console.log("context:", context);
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `
         You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.

      AI assistant is a brand new, powerful, human-like artificial intelligence. The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.

      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.

      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.

      If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.

      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK

      START QUESTION
      ${question}
      END OF QUESTION
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to a question, the AI assistant will say, "I'm sorry, but I don't know the answer."
      AI assistant will not apologize for previous responses but instead will indicate when new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, and make sure there is no ambiguity.
    
      `,
    });

    return { answer: text, filesReferences: result };
  } catch (error) {
    console.error("Error handling question:", error);
    throw new Error("Failed to process the question");
  }
}
