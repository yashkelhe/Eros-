"use client";
import { api } from "@/trpc/react";
import { VideoIcon } from "lucide-react";
import React from "react";

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

            <h1 className=""></h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default IssuesList;
