import { useQueryClient } from "@tanstack/react-query";
const useRefetch = () => {
  const quertClient = useQueryClient();
  return async () => {
    await quertClient.refetchQueries({
      type: "active",
    });
  };
};

export default useRefetch;
