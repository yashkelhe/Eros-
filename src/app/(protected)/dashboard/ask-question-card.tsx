"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    {
      fileName: string;
      sourceCode: string;
      summary: string;
    }[]
  >([]);
  const [answer, setAnswer] = React.useState("");

  // tale the question
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id) return;

    setLoading(true);
    setOpen(true);
    // pass the question and projectId
    const { output, filesReferences } = await askQuestion(question, project.id);
    setFilesReferences(filesReferences);
    // window.alert(question);
    // console.log(question);

    // just here we are taking the token one by one and appending one by one
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            {/* logo */}
            <Image src="/ffinal.png" alt="Eros" width={80} height={80} />
            <DialogTitle>{question}</DialogTitle>
          </DialogHeader>

          {answer}
          <h1>file References </h1>
          {filesReferences.map((file) => {
            return <span>{file.fileName}</span>;
          })}
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask the question</CardTitle>

          <CardContent>
            <form onSubmit={onSubmit}>
              <Textarea
                placeholder="white file should I edit to change the home page "
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="h-4"></div>
              <Button type="submit">Ask Eros! </Button>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
};

export default AskQuestionCard;
