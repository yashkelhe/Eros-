// /api/process-meeting

import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const bodyParser = z.object({
  meetingUrl: z.string(),
  projectId: z.string(),
  meetingId: z.string(),
});

// in the varcel this function might get time out
// so explicitly set the timeout to 5 minutes
export const maxDuration = 300; // 5 minutes
export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { meetingUrl, meetingId } = bodyParser.parse(body);
    // Do something with the body

    console.log("Audio Url  : ", meetingUrl);
    const { summarizes } = await processMeeting(meetingUrl);

    console.log("this are the summary : ", summarizes);
    await db.issue.createMany({
      data: summarizes.map((summary) => ({
        start: summary.start,
        end: summary.end,
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
        meetingId,
      })),
    });

    await db.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        status: "COMPLETED",
        name: summarizes[0]!.headline,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 400 },
    );
  }
}
