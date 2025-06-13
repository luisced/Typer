import { useMutation, useQuery } from '@tanstack/react-query';
import { saveTest, fetchAllTests } from '../services/tests';
import type { TestCreate, TestResponse } from '../services/tests';

export const useTests = () => {
  const saveTestMutation = useMutation<TestResponse, Error, TestCreate>({
    mutationFn: saveTest,
  });
  const { data: tests, isLoading, error } = useQuery<TestResponse[], Error>({
    queryKey: ['tests'],
    queryFn: fetchAllTests,
  });

  return {
    saveTest: saveTestMutation.mutate,
    tests,
    isLoading,
    error,
  };
}; 