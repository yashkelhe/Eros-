import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  // Fetch projects for the user
  const {
    data: projects,
    isLoading,
    isError,
  } = api.project?.getProjectsOfUser?.useQuery();

  if (isError) {
    console.error("Error fetching projects:", isError);
  }
  // console.log("from backend ", projects);

  const [projectId, setProjectId] = useLocalStorage("dionysus-projectId", null);
  // console.log("from localStorage ", projectId);

  const project = projects?.find((project) => project.id === projectId);
  // console.log("from specific one", project);

  return {
    isLoading,
    projects, // All the projects
    project, // Specific project
    projectId, // Selected project ID
    setProjectId, // Function to set project ID
  };
};

export default useProject;
