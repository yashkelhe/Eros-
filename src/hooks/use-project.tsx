import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getAllProjects.useQuery();

  //   it use to store the project id so once u refresh the project dont gone
  const [projectId, setProjectId] = useLocalStorage("dionysus-projectId", "");

  //   get the all the prjects
  const project = projects?.find((project) => project.id === projectId);
  return {
    projects, //all the projects
    project, // sopecific project
    projectId, //project id of sepecific
    setProjectId,
  };
};

export default useProject;
