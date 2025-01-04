import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const processMeeting = async (meetingUrl: string) => {
  const transcript = await client.transcripts.transcribe({
    audio_url: meetingUrl,
    auto_chapters: true, // Automatically detect automatically detect all the different issue and summarize them
  });

  const summarizes =
    transcript.chapters?.map((chapter) => ({
      start: msToTime(chapter.start),
      end: msToTime(chapter.end),
      gist: chapter.gist, // gist is the main point of the chapter
      headline: chapter.headline, // headline is the title of the chapter
      summary: chapter.summary, // summary is the summary of the chapter
    })) || [];

  if (!transcript.text) throw new Error("No transcript found");

  // console.log(transcript.text);
  return { transcript, summarizes };
};

// working nicely keep going
// const FILE_URL = "https://assembly.ai/sports_injuries.mp3";

// const FILE_URL ="https://ctvpuxhtzwnbkehyfiik.supabase.co/storage/v1/object/public/Eros-audio/1735913989684-audio.mp3";

// const response = await processMeeting(FILE_URL);

// console.log(response);
