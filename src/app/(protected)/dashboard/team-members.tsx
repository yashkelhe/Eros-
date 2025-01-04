import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();

  const { data: members } = api.project.getTeamMembers.useQuery({
    projectId: projectId!,
  });
  return (
    <div className="flex items-center gap-2">
      {members?.map((member) => (
        <img
          key={member.id}
          src={member.user.imageUrl || ""}
          alt={member.user.firstName || ""}
          className="h-8 w-8 rounded-full"
          height={30}
          width={30}
        />
      ))}
    </div>
  );
};

export default TeamMembers;
