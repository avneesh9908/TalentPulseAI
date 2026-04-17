import { useCallback, useState } from "react";
import axios from "axios";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <TResult, TArgs extends unknown[]>(
      apiFunction: (...args: TArgs) => Promise<TResult>,
      ...args: TArgs
    ): Promise<TResult> => {
      setLoading(true);
      setError(null);

      try {
        return await apiFunction(...args);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { request, loading, error, setError };
};
