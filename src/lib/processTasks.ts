import { db } from "@/server/db";
import { processMeeting } from "@/lib/assembly";

export async function processTasks(): Promise<void> {
  // Fetch pending meetings
  const pendingMeetings = await db.meeting.findMany({
    where: { status: "PROCESSING" },
  });

  for (const meeting of pendingMeetings) {
    try {
      console.log(`Processing meeting ID: ${meeting.id}`);

      // Process meeting using your logic
      const { summarizes } = await processMeeting(meeting.meetingUrl);
      // Save summaries to the database
      await db.issue.createMany({
        data: summarizes.map((summary) => ({
          start: summary.start,
          end: summary.end,
          gist: summary.gist,
          headline: summary.headline,
          summary: summary.summary,
          meetingId: meeting.id,
        })),
      });

      // Update meeting status
      await db.meeting.update({
        where: { id: meeting.id },
        data: {
          status: "COMPLETED",
          name: summarizes[0]?.headline || "Meeting",
        },
      });

      console.log(`Meeting ID ${meeting.id} processed successfully.`);
    } catch (error) {
      console.error(`Error processing meeting ID ${meeting.id}:`, error);
    }
  }
}

// Call the function
processTasks().catch((error) =>
  console.error("Error in processing tasks:", error),
);
