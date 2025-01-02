"use client";

import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./actions";
import { api } from "@/trpc/react";
import CodeReferences from "./code-references";
import useRefetch from "@/hooks/use-refetch";
import { toast } from "sonner";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const saveAnswer = api.project.saveAnswer.useMutation();

  const [filesReferences, setFilesReferences] = useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const [answer, setAnswer] = useState<string>("");
  const refetch = useRefetch();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.id) return;

    setLoading(true);

    try {
      const { answer: aiAnswer, filesReferences } = await askQuestion(
        question,
        project.id,
      );
      setOpen(true);
      setAnswer(aiAnswer);
      setFilesReferences(filesReferences);
    } catch (error) {
      console.error("Error fetching answer:", error);
      setAnswer("Failed to fetch the answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[45vw] max-w-[70vw] overflow-auto">
          <DialogHeader>
            <div className="flex">
              <DialogTitle>
                {question}
                <Image src="/ffinal.png" alt="Eros" width={80} height={80} />
              </DialogTitle>

              <Button
                variant={"outline"}
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      fileReference: filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved", {
                          position: "top-right",
                          style: { backgroundColor: "#4CAF50", color: "#fff" },
                        });
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to save answer", {
                          position: "top-right",
                          style: { backgroundColor: "#F44336", color: "#fff" },
                        });
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <MDEditor.Markdown
            source={answer || ""}
            className="max-h-[50vh] max-w-[65vw] overflow-auto"
          />

          <div className="h-4"></div>
          <CodeReferences fileReferences={filesReferences} />

          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            {" "}
            close
          </Button>

          {/* {filesReferences.length > 0 && (
            <>
              <h2 className="mt-6 font-semibold">File References:</h2>
              <ul>
                {filesReferences.map((file, index) => (
                  <li key={index} className="mt-2">
                    {file.fileName}
                  </li>
                ))}
              </ul>
            </>
          )} */}
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the homepage?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="mt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Asking..." : "Ask Eros!"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
