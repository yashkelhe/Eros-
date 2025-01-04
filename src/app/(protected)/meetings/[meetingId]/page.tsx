import React from "react";
import IssuesList from "./issues-list";

// take the meeting Id from the Url
type Props = {
  params: Promise<{ meetingId: string }>;
};
const MeetingDetailsPage = async (pro: Props) => {
  const { params } = pro;
  const { meetingId } = await params;
  return (
    <>
      <IssuesList meetingId={meetingId} />
    </>
  );
};

export default MeetingDetailsPage;
