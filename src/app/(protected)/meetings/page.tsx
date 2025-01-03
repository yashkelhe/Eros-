"use client";

import { api } from "@/trpc/react";
import React, { useEffect, useState } from "react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import useProject from "@/hooks/use-project";
import { solarizedDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Page = () => {
  const { projectId } = useProject();
  console.log("project Id is : - ", projectId);
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery({
    projectId: String(projectId),
  });

  return (
    <>
      {/* {meetings?.map((meeting, index) => <div key={index}>{meeting.name}</div>)} */}
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-2x1 font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No Meetings found</div>}
      {isLoading && <div>Loading meetings...</div>}
      {projectId}
      {
        <ul className="divide-y divide-gray-200">
          {meetings?.map((meeting, index) => (
            <li
              className="flex items-center justify-between gap-x-6 p-5"
              key={index}
            >
              <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/meetings/${meeting.id}`}
                      className="text-sm font-semibold"
                    >
                      {meeting.name}
                    </Link>
                    {meeting.status === "PROCESSING" && (
                      <Badge className="bg-yellow-500 text-white">
                        Processing...
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      }
    </>
  );
};

export default Page;
