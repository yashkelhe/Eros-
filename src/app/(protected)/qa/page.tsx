"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import useProject from "@/hooks/use-project";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QApage = () => {
  const { projectId } = useProject();

  // Fetch projects of the user
  const { data: project, error: projectError } =
    api.project.getProjectsOfUser.useQuery();

  // Fetch questions related to the current project
  const { data: questions, error: questionsError } =
    api.project.getQuestions.useQuery(
      { projectId },
      { enabled: !!projectId }, // Ensure the query only runs if projectId exists
    );

  if (projectError || questionsError) {
    return (
      <div>Error occurred while fetching data. Please try again later.</div>
    );
  }

  // Extract project IDs for debugging purposes
  const projectIds = project?.flatMap((p) =>
    p.userToProjects.map((utp) => utp.user.id),
  );

  console.log("Project of the specific user", project);
  console.log("Project IDs of the specific user", projectIds);

  const [questionIndex, setQuestionIndex] = React.useState(0);

  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-medium">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => (
          <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                <img
                  className="rounded-full"
                  height={30}
                  width={30}
                  src={question.user.imageUrl ?? ""}
                />

                <div className="flex flex-col text-sm">
                  <div className="flex items-center gap-2">
                    <p className="line-clamp-1 text-lg font-medium text-gray-700">
                      {question.question}
                    </p>
                    <span className="whitespace-nowrap text-xs text-gray-400">
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        ))}
      </div>
      {question && (
        <SheetContent className="overflow-scroll sm:max-w-[110vh]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <MDEditor.Markdown
              source={question.answer}
              className="scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-primary-200 max-h-[60vh] overflow-scroll"
            />
            <CodeReferences
              fileReferences={(question.fileReference ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QApage;
