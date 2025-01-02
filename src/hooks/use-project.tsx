import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  // Fetch projects for the user
  const { data: projects } = api.project.getProjectsOfUser.useQuery();

  // Local storage to persist the selected project ID
  const [projectId, setProjectId] = useLocalStorage("dionysus-projectId", "");

  // Validate if the projectId from localStorage exists in the fetched projects
  const project = projects?.find((project) => project.id === projectId);

  // Return all required data, including loading and error states
  return {
    projects, // All the projects
    project, // Specific project
    projectId, // Selected project ID
    setProjectId, // Function to set project ID
  };
};

export default useProject;
