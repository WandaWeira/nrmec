import { QueryClient } from '@tanstack/react-query';

// Create a Query Client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default options for all queries
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Only retry failed queries once
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    },
    mutations: {
      // Default options for all mutations
      retry: 1, // Only retry failed mutations once
    },
  },
});

export default queryClient;
