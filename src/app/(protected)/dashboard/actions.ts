"use server";
import { db } from "@/server/db";

import { streamText } from "ai";
// import { readStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
// import { db } from "@/server/db";

// Initialize Google Generative AI
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API,
});

export async function askQuestion(question: string, projectId: string) {
  // Initialize a stream to capture incremental results
  const stream: {
    append: (chunk: string) => void;
    done: () => void;
    value: string[];
  } = {
    value: [],
    append(chunk) {
      this.value.push(chunk);
    },
    done() {
      console.log("Stream completed.");
    },
  };

  try {
    // Generate query embedding vector
    const queryVector = await generateEmbedding(question);
    const vectorQuery = `[${queryVector.join(",")}]`;

    console.log("Executing Query:", db.$queryRawUnsafe);

    // const result = (await db.$queryRaw`
    //   SELECT "fileName", "sourceCode", "summary",
    //   1 - ('summaryEmbedding' <=> ${vectorQuery}::vector) AS similarity
    //   FROM "SourceCodeEmbedding"
    //   WHERE 1 - ('summaryEmbedding' <=> ${vectorQuery}::vector) > 0.5
    //   AND "projectId" = ${projectId}
    //   ORDER BY similarity DESC
    //   LIMIT 10
    // `) as { fileName: string; sourceCode: string; summary: string }[];

    const result = await db.$queryRawUnsafe<
      {
        fileName: string;
        sourceCode: string;
        summary: string;
      }[]
    >(
      `
      SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
      AND "projectId" = '${projectId}'
      ORDER BY similarity DESC
      LIMIT 10;
    `,
    );

    // console.log("Executing Query:", db.$queryRawUnsafe);
    console.log("we are streaming");
    let context = "";

    // Combine results into a context block
    for (const doc of result) {
      context += `source: ${doc.fileName} \ncode content : ${doc.sourceCode} \n summary of file : ${doc.summary}\n\n`;
    }

    // Stream text using the AI model
    (async () => {
      const { textStream } = await streamText({
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

      for await (const delta of textStream) {
        console.log(delta);
        stream.append(delta);
      }

      stream.done();
    })();

    return {
      output: stream.value.join(""),
      filesReferences: result,
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to process the question");
  }
}
