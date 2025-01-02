"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};
const CodeReferences = ({ fileReferences }: Props) => {
  const [tab, setTab] = React.useState(fileReferences[0]?.fileName);
  if (fileReferences.length === 0) {
    return null;
  }
  return (
    <div className="max-w-[65vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-y-autoscroll flex gap-2 overflow-x-auto rounded-md bg-gray-200 p-1">
          {fileReferences.map((file, index) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={index}
              className={cn(
                "whitespace-nowrap rounded-md p-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                { "bg-primary text-primary-foreground": tab === file.fileName },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>

        {fileReferences.map((file, index) => (
          <TabsContent
            key={index}
            value={file.fileName}
            className="max-h-[40vh] max-w-7xl overflow-scroll rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={lucario}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
