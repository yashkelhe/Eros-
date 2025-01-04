"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouterOutputs, api } from "@/trpc/react";

import { VideoIcon } from "lucide-react";
import React, { useState } from "react";

type Props = {
  meetingId: string;
};
const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    {
      meetingId,
    },
    {
      refetchInterval: 4000,
    },
  );

  if (isLoading || !meeting) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="p-8">
        <div className="max-w-2x1 mx-auto flex items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-6">
            <div className="rounded-full border bg-white p-3">
              <VideoIcon className="h-8 w-8" />
            </div>

            <h1 className="">
              <div className="text-sm leading-6 text-gray-600">
                Meeting on {meeting.createdAt.toLocaleDateString()}
              </div>
              <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meeting.issues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </>
  );
};

function IssueCard({
  issue,
}: {
  issue: NonNullable<
    RouterOutputs["project"]["getMeetingById"]
  >["issues"][number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issue.gist}</DialogTitle>
            <DialogDescription>
              {issue.createdAt.toLocaleDateString()}
            </DialogDescription>
            <p className="text-gray-600">{issue.headline}</p>
            <blockquote className="mt-4 border-l-2 border-gray-300 bg-gray-50 p-4 pt-4">
              <span className="text-sm text-gray-600">
                {issue.start} - {issue.end}
              </span>

              <p className="font-medium italic leading-relaxed text-gray-900">
                {issue.summary}
              </p>
            </blockquote>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issue.gist}</CardTitle>
          <div className="border-b"></div>

          <CardDescription>{issue.headline}</CardDescription>
        </CardHeader>

        <CardContent>
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}
export default IssuesList;
