"use client";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { CircularProgressbar } from "react-circular-progressbar";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

const MeetingCard = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const { project } = useProject();
  const router = useRouter();
  console.log("project Id is : - ", project?.id);
  //   we can even customize the dropzone to accept only audio files

  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".flac"],
    },
    multiple: false,
    maxSize: 50_000_000, //file size in bytes 50 MB
    onDrop: async (acceptedFiles: File[]) => {
      setIsUploading(true);
      // console.error("Accepted files: -", acceptedFiles);
      const file = acceptedFiles[0]; // single file

      if (!file) return;
      if (!acceptedFiles || acceptedFiles.length === 0) {
        console.error("No files were dropped.");
        return;
      }
      try {
        //   store the file in FB and  then take URL from FB
        const downloadURL = (await uploadFile(
          file as File,
          setProgress,
        )) as string;

        if (!downloadURL) throw new Error("Failed to retrieve download URL.");
        uploadMeeting.mutate(
          {
            projectId: project?.id ?? "",
            meetingUrl: downloadURL,
            name: file.name,
          },
          {
            onSuccess: () => {
              toast.success("Meeting uploaded successfully");
              router.push("/meetings");
            },
            onError: (error) => {
              toast.error("Failed to Upload the File ");
            },
          },
        );
        // window.alert(`the Linke is here ${downloadURL}`);
        // console.log(`the Linke is here ${downloadURL}`);

        setIsUploading(false);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    },
  });
  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Eros
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
          />
          <p className="text-sm text-gray-500">Uploading your Meeting</p>
        </div>
      )}
      <div>Meeting</div>
    </Card>
  );
};

export default MeetingCard;
