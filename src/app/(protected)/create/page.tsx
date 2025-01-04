"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import useRefetch from "@/hooks/use-refetch";
import { Info } from "lucide-react";
type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};
const CreatePage = () => {
  // there are three things in the useForm

  const { register, handleSubmit, reset } = useForm<FormInput>();

  // to call the backend route
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();

  const refetch = useRefetch();
  function onSubmit(data: FormInput) {
    if (!checkCredits.data) {
      createProject.mutate(
        {
          name: data.projectName,
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Project created Successfully");
            // reset the after creating
            refetch();
            reset();
          },
          onError: () => {
            toast.error("Failed to create project");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
  }
  //   the object to json.stringify(data)
  // sending the message to backend via route and also we have taken this input with type safty of zod

  const hashEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/createPage.png" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link Your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your Repository to link it to Dionysus
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder="Enter Project Name"
              {...register("projectName", { required: true })}
              required
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github Url"
              type="url"
              {...register("repoUrl", { required: true })}
              required
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github Token (Optional)"
              {...register("githubToken")}
            />

            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this Repository{" "}
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    You have <strong>{checkCredits.data?.userCredits}</strong>
                    credits remaining
                  </p>
                </div>
              </>
            )}
            <div className="h-4"></div>

            {/* diabled the button untile we are creating the new  project in database */}
            <Button
              type="submit"
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                !hashEnoughCredits
              }
            >
              {!!checkCredits.data ? "Create Project" : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
