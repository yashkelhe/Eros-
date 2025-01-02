"use client";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React from "react";
import { Button } from "react-day-picker";
import { useDropzone } from "react-dropzone";

const MeetingCard = () => {
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  //   we can even customize the dropzone to accept only audio files
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".flac"],
    },
    multiple: false,
    maxSize: 50_000_000, //file size in bytes 50 MB
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0]; // single file

      //   store the file in FB and  then take URL from FB
      const downloadURL = await uploadFile(file as File, setProgress);
      setIsUploading(false);
    },
  });
  return (
    <Card className="col-span-2 flex flex-col items-center justify-center">
      {isUploading && (
        <>
          <Presentation className="flex h-10 flex-col items-center justify-center" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Create ka new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Eros
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1 h-5 w-5" aria-hidden="true" />
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default MeetingCard;
